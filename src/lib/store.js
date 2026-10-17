/**
 * TimeTag data store — everything the pages show and change.
 *
 * Watches, collections, settings (announcement bar, Signature picks) and orders live in the
 * Supabase database (see src/lib/supabase.js and supabase/setup.sql). This file loads them,
 * keeps a copy in memory for the pages, and saves changes back.
 *
 * Saving takes a moment and can fail (no internet, signed out…), so every function that
 * changes something is `async` and returns { ok: true } or { ok: false, error: 'message' }.
 *
 * Kept on the visitor's own device (not in the database): the bag, and the orders they placed
 * on this device (so the thank-you page can show them).
 */
import { useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_ANNOUNCEMENTS, WATCH_STYLES } from '../data/products.js';
import { auth, db, storage } from './supabase.js';
import { dataUrlToBlob } from './images.js';

const KEYS = {
  cart: 'timetag:cart', // [{ id, qty }]
  myOrders: 'timetag:my-orders', // orders placed on this device
  cache: 'timetag:catalog-cache', // last loaded watches/collections/settings, for a fast first paint
};

export const LOW_STOCK = 3;
export const MAX_PER_ITEM = 5;
export const MAX_SIGNATURE = 4; // the home page dial fits 4 watches

// The prices here are only for display — the database (place_order in supabase/setup.sql)
// decides the real shipping price, so keep the two in sync.
export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard delivery', detail: '3–5 business days', price: 0 },
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery (COD)', detail: 'Pay in cash when your watch arrives.' },
  { id: 'bank', label: 'Bank transfer', detail: 'Pay to Bank Alfalah or JazzCash, then send us the payment screenshot on WhatsApp.' },
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/* ---------------- saving on this device ---------------- */
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — keep in memory */
  }
}

/* ---------------- tiny external store ---------------- */
const cache = read(KEYS.cache, null);

let state = {
  // 'loading' (nothing to show yet) | 'ready' | 'error' (couldn't load and nothing cached)
  status: cache ? 'ready' : 'loading',
  error: '',
  products: cache?.products || [], // [{ id, name, collectionIds, price, stock, … }]
  collections: cache?.collections || [], // [{ id, title, image, sort }]
  settings: cache?.settings || { announcement: null, signature: null },
  orders: [], // all orders — only loaded for a signed-in admin
  ordersStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  ordersError: '',
  myOrders: read(KEYS.myOrders, []),
  cart: read(KEYS.cart, []),
  cartOpen: false,
};
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  if ('cart' in patch) write(KEYS.cart, state.cart);
  if ('myOrders' in patch) write(KEYS.myOrders, state.myOrders);
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// keep the bag in sync between open tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.cart) setState({ cart: read(KEYS.cart, []) });
  });
}

const useSlice = (pick) => useSyncExternalStore(subscribe, () => pick(state), () => pick(state));

const ok = (extra) => ({ ok: true, ...extra });
const fail = (e) => ({ ok: false, error: e?.message || String(e) });

const slug = (s, fallback) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || fallback;

/* ---------------- database rows ⇄ what the pages use ---------------- */
const fromProductRow = (r) => ({
  id: r.id,
  name: r.name,
  // the collections it's in, e.g. ['rolex', 'automatic'] (older databases had a single collection_id)
  collectionIds: r.collection_ids || (r.collection_id ? [r.collection_id] : []),
  price: r.price,
  stock: r.stock,
  badge: r.badge || '',
  description: r.description || '',
  strap: r.strap || '',
  gender: r.gender || [],
  tags: r.tags || [],
  watchStyle: r.watch_style || 'steelChrono',
  images: r.images || [],
  active: r.active,
  rating: r.rating || 5,
  createdAt: r.created_at,
});

const PRODUCT_COLUMNS = {
  name: 'name',
  collectionIds: 'collection_ids',
  price: 'price',
  stock: 'stock',
  badge: 'badge',
  description: 'description',
  strap: 'strap',
  gender: 'gender',
  tags: 'tags',
  watchStyle: 'watch_style',
  images: 'images',
  active: 'active',
  rating: 'rating',
};
function toProductRow(patch) {
  const row = {};
  for (const [key, column] of Object.entries(PRODUCT_COLUMNS)) {
    if (key in patch) row[column] = patch[key] === '' && (key === 'badge' || key === 'strap') ? null : patch[key];
  }
  return row;
}

const fromCollectionRow = (r) => ({ id: r.id, title: r.title, image: r.image || null, sort: r.sort ?? 0 });

const fromOrderRow = (r) => ({
  id: r.id,
  number: r.number,
  createdAt: r.created_at,
  status: r.status,
  customer: r.customer || {},
  newsletter: !!r.newsletter,
  shipping: r.shipping,
  payment: r.payment,
  items: r.items || [],
  subtotal: r.subtotal,
  total: r.total,
  history: r.history || [],
});

/* ---------------- loading from the database ---------------- */
let lastLoad = 0;
let loading = null;

/** Loads watches, collections and settings. Signed-in admins also get hidden watches. */
export function loadCatalog() {
  if (loading) return loading;
  loading = (async () => {
    try {
      const [products, collections, settings] = await Promise.all([
        db.select('products', 'order=created_at.desc'),
        db.select('collections', 'order=sort.asc,created_at.asc'),
        db.select('settings'),
      ]);
      const next = {
        products: products.map(fromProductRow),
        collections: collections.map(fromCollectionRow),
        settings: {
          announcement: settings.find((s) => s.key === 'announcement')?.value ?? null,
          signature: settings.find((s) => s.key === 'signature')?.value ?? null,
        },
      };
      setState({ ...next, status: 'ready', error: '' });
      // remember it for next time, minus hidden watches (only admins should see those)
      write(KEYS.cache, { ...next, products: next.products.filter((p) => p.active) });
      lastLoad = Date.now();
    } catch (e) {
      setState(state.status === 'ready' ? { error: e.message } : { status: 'error', error: e.message });
    } finally {
      loading = null;
    }
  })();
  return loading;
}

if (typeof window !== 'undefined') {
  loadCatalog();
  // coming back to the tab after a while: fetch fresh stock and prices
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastLoad > 2 * 60 * 1000) loadCatalog();
  });
  // signing out: forget the orders and hidden watches
  auth.onChange((session) => {
    if (!session) {
      setState({ orders: [], ordersStatus: 'idle', ordersError: '' });
      loadCatalog();
    }
  });
}

/** 'loading' | 'ready' | 'error', and the error message if loading failed. */
export const useCatalogStatus = () => useSlice((s) => s.status);
export const useCatalogError = () => useSlice((s) => s.error);

/* ---------------- photos & logos ---------------- */
/** Uploads any new pictures (data: addresses from the photo picker) and returns web addresses. */
async function uploadImages(folder, images) {
  return Promise.all(
    images.map(async (src, i) => {
      if (!src?.startsWith('data:')) return src; // already uploaded, or a file on the site
      const blob = dataUrlToBlob(src);
      const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
      const name = `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      return storage.upload(`${folder}/${name}`, blob);
    })
  );
}
/** Deletes pictures that are no longer used (ignores failures — they're only wasted space). */
const forgetImages = (urls) => storage.removeByUrl(urls).catch(() => {});

/* ---------------- collections ---------------- */
/** "Master Grade" → "MG". Shown in the circle when a collection has no logo. */
const initials = (title) =>
  title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

/** The collections, in display order: [{ id, title, image, mark }]. */
export function useCollections() {
  const list = useSlice((s) => s.collections);
  return useMemo(() => list.map((c) => ({ ...c, mark: initials(c.title) })), [list]);
}

const titleTaken = (title, exceptId) =>
  state.collections.some((c) => c.id !== exceptId && c.title.trim().toLowerCase() === title.trim().toLowerCase());

/** Adds a collection from the admin. Returns { ok, collection } or { ok: false, error }. */
export async function addCollection({ title, image = null }) {
  const name = title.trim();
  if (!name) return fail('Enter a collection name.');
  if (titleTaken(name)) return fail(`You already have a collection called “${name}”.`);
  const taken = new Set(state.collections.map((c) => c.id));
  let id = slug(name, 'collection');
  for (let n = 2; taken.has(id); n++) id = `${slug(name, 'collection')}-${n}`;
  try {
    const [logo] = image ? await uploadImages('collections', [image]) : [null];
    const sort = state.collections.reduce((max, c) => Math.max(max, c.sort), 0) + 1;
    const row = await db.insert('collections', { id, title: name, image: logo, sort });
    const collection = fromCollectionRow(row);
    setState({ collections: [...state.collections, collection] });
    return ok({ collection });
  } catch (e) {
    return fail(e);
  }
}

/** Renames a collection or changes its logo. Its watches follow automatically. */
export async function updateCollection(id, { title, image }) {
  const name = title.trim();
  if (!name) return fail('Enter a collection name.');
  if (titleTaken(name, id)) return fail(`You already have a collection called “${name}”.`);
  const before = state.collections.find((c) => c.id === id);
  try {
    const [logo] = image ? await uploadImages('collections', [image]) : [null];
    const row = await db.update('collections', { id }, { title: name, image: logo });
    setState({ collections: state.collections.map((c) => (c.id === id ? fromCollectionRow(row) : c)) });
    if (before?.image && before.image !== logo) forgetImages([before.image]);
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/** Deletes a collection. Its watches are kept; it's just taken off their list (the database does the same). */
export async function deleteCollection(id) {
  const before = state.collections.find((c) => c.id === id);
  try {
    await db.remove('collections', { id });
    setState({
      collections: state.collections.filter((c) => c.id !== id),
      products: state.products.map((p) => ({ ...p, collectionIds: (p.collectionIds || [p.collectionId]).filter((c) => c && c !== id) })),
    });
    if (before?.image) forgetImages([before.image]);
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- catalog ---------------- */
function buildCatalog(products, collections) {
  const byId = new Map(collections.map((c) => [c.id, c]));
  return products.map((p) => {
    // (a copy saved on this device before 17 Oct 2026 may still have a single collectionId)
    const ids = p.collectionIds || (p.collectionId ? [p.collectionId] : []);
    const cols = ids.map((id) => byId.get(id)).filter(Boolean);
    return {
      ...p,
      collectionIds: cols.map((c) => c.id), // every collection it's in
      collectionNames: cols.map((c) => c.title),
      collectionId: cols[0]?.id || null, // the first one: used for the card name and breadcrumb
      collection: cols[0]?.title || '', // the name shown on the site ('' = no collection)
      watch: WATCH_STYLES[p.watchStyle] || WATCH_STYLES.steelChrono, // drawing used until there are photos
    };
  });
}

/** All products (admins also get hidden ones) with live stock and price. */
export function useCatalog() {
  const products = useSlice((s) => s.products);
  const collections = useSlice((s) => s.collections);
  return useMemo(() => buildCatalog(products, collections), [products, collections]);
}

/** Products visible in the shop. */
export function useShopProducts() {
  const all = useCatalog();
  return useMemo(() => all.filter((p) => p.active), [all]);
}

const getCatalog = () => buildCatalog(state.products, state.collections);

// Changes to the same watch are saved one after another (e.g. typing "12" in the stock box
// sends "1" then "12" — the "12" must win).
const queues = new Map();
function inOrder(id, task) {
  const run = (queues.get(id) || Promise.resolve()).catch(() => {}).then(task);
  queues.set(id, run);
  return run;
}

/** Saves edits to a watch (price, stock, photos, text…). Returns { ok, error? }. */
export async function updateProduct(id, patch) {
  const before = state.products.find((p) => p.id === id);
  if (!before) return fail('This watch no longer exists.');
  const replace = (p) => setState({ products: state.products.map((x) => (x.id === id ? p : x)) });
  replace({ ...before, ...patch }); // show the change straight away…
  try {
    const row = await inOrder(id, async () => {
      const images = patch.images ? await uploadImages(`products/${id}`, patch.images) : undefined;
      return db.update('products', { id }, toProductRow({ ...patch, ...(images && { images }) }));
    });
    const saved = fromProductRow(row);
    replace(saved);
    if (patch.images) forgetImages(before.images.filter((u) => !saved.images.includes(u)));
    return ok();
  } catch (e) {
    replace(before); // …and undo it if saving failed
    return fail(e);
  }
}

/** Adds a new watch from the admin. Returns { ok, product } or { ok: false, error }. */
export async function addProduct(data) {
  const taken = new Set(state.products.map((p) => p.id));
  let id = slug(data.name, 'watch');
  for (let n = 2; taken.has(id); n++) id = `${slug(data.name, 'watch')}-${n}`;
  try {
    const images = await uploadImages(`products/${id}`, data.images || []);
    const row = await db.insert('products', { id, ...toProductRow({ ...data, images }) });
    const product = fromProductRow(row);
    setState({ products: [product, ...state.products] });
    return ok({ product });
  } catch (e) {
    return fail(e);
  }
}

/** Permanently deletes a watch (past orders keep their copy of its name and price). */
export async function deleteProduct(id) {
  const before = state.products.find((p) => p.id === id);
  try {
    await db.remove('products', { id });
    setState({ products: state.products.filter((p) => p.id !== id), cart: state.cart.filter((l) => l.id !== id) });
    if (before) forgetImages(before.images);
    // free its Signature Collection slot, if it had one
    const slots = state.settings.signature || [];
    if (slots.includes(id)) await setSignatureSlots(slots.map((s) => (s === id ? '' : s)));
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- settings ---------------- */
/**
 * Saves one setting. `showFirst`: update the page straight away and undo it if saving fails
 * (good for quick picks); otherwise the page only changes once it's saved.
 */
async function saveSetting(key, value, { showFirst = false } = {}) {
  const before = state.settings[key];
  if (showFirst) setState({ settings: { ...state.settings, [key]: value } });
  try {
    await db.upsert('settings', { key, value, updated_at: new Date().toISOString() }, 'key');
    if (!showFirst) setState({ settings: { ...state.settings, [key]: value } });
    return ok();
  } catch (e) {
    if (showFirst) setState({ settings: { ...state.settings, [key]: before } });
    return fail(e);
  }
}

/* ---------------- announcement bar ---------------- */
export const MAX_ANNOUNCEMENTS = 8;
export const MAX_ANNOUNCEMENT_LENGTH = 80;
const DEFAULT_ANNOUNCEMENT = { show: true, messages: DEFAULT_ANNOUNCEMENTS };

/** The sliding bar above the header: { show, messages }. */
export function useAnnouncement() {
  return useSlice((s) => s.settings.announcement) || DEFAULT_ANNOUNCEMENT;
}

/** Saves the bar's text from the admin. Empty lines are dropped. Returns { ok, error? }. */
export function setAnnouncement({ show, messages }) {
  const clean = messages.map((m) => m.trim().slice(0, MAX_ANNOUNCEMENT_LENGTH)).filter(Boolean).slice(0, MAX_ANNOUNCEMENTS);
  if (show && !clean.length) return Promise.resolve(fail('Add at least one message, or switch the bar off.'));
  return saveSetting('announcement', { show: !!show, messages: clean });
}

/** Goes back to the default text (DEFAULT_ANNOUNCEMENTS in data/products.js). */
export const resetAnnouncement = () => saveSetting('announcement', DEFAULT_ANNOUNCEMENT);

/* ---------------- Signature Collection ---------------- */
const NO_PICKS = [];

/** The 4 slots picked in the admin: ['watch-id', '', …] ('' = empty slot). */
export function useSignatureSlots() {
  const stored = useSlice((s) => s.settings.signature);
  return useMemo(
    () => Array.from({ length: MAX_SIGNATURE }, (_, i) => (stored || NO_PICKS)[i] || ''),
    [stored]
  );
}

/** Saves the Signature Collection slots (up to 4 watch ids, '' for empty). */
export function setSignatureSlots(slots) {
  return saveSetting('signature', slots.slice(0, MAX_SIGNATURE).map((id) => id || ''), { showFirst: true });
}

/**
 * Watches for the home page dial: the picked ones that are visible, in slot order.
 * If none are picked (or all are hidden), the first 4 Best Sellers — so the dial is never empty.
 */
export function useSignatureProducts() {
  const products = useShopProducts();
  const slots = useSignatureSlots();
  return useMemo(() => {
    const picked = slots.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    if (picked.length) return picked;
    const best = products.filter((p) => p.tags.includes('best'));
    return (best.length ? best : products).slice(0, MAX_SIGNATURE);
  }, [products, slots]);
}

/* ---------------- cart (kept on this device) ---------------- */
export function useCart() {
  const cart = useSlice((s) => s.cart);
  const catalog = useCatalog();
  return useMemo(() => {
    const lines = cart
      .map((line) => {
        const product = catalog.find((p) => p.id === line.id);
        return product && product.active ? { ...line, product, lineTotal: product.price * line.qty } : null;
      })
      .filter(Boolean);
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
    return { lines, count, subtotal };
  }, [cart, catalog]);
}

export const useCartOpen = () => useSlice((s) => s.cartOpen);
export const openCart = () => setState({ cartOpen: true });
export const closeCart = () => setState({ cartOpen: false });

function clampQty(id, qty) {
  const product = getCatalog().find((p) => p.id === id);
  const max = Math.min(MAX_PER_ITEM, product ? product.stock : 0);
  return Math.max(0, Math.min(qty, max));
}

export function addToCart(id, qty = 1) {
  const existing = state.cart.find((l) => l.id === id);
  const nextQty = clampQty(id, (existing?.qty || 0) + qty);
  if (nextQty <= 0) return false;
  const cart = existing
    ? state.cart.map((l) => (l.id === id ? { ...l, qty: nextQty } : l))
    : [...state.cart, { id, qty: nextQty }];
  setState({ cart });
  return true;
}

export function setCartQty(id, qty) {
  const q = clampQty(id, qty);
  setState({ cart: q <= 0 ? state.cart.filter((l) => l.id !== id) : state.cart.map((l) => (l.id === id ? { ...l, qty: q } : l)) });
}

export const removeFromCart = (id) => setState({ cart: state.cart.filter((l) => l.id !== id) });
export const clearCart = () => setState({ cart: [] });

/* ---------------- orders ---------------- */
/** All orders (signed-in admin only), newest first. */
export const useOrders = () => useSlice((s) => s.orders);
export const useOrdersStatus = () => useSlice((s) => s.ordersStatus);
export const useOrdersError = () => useSlice((s) => s.ordersError);

/** One order: from the admin's list, or one placed on this device (for the thank-you page). */
export function useOrder(id) {
  const orders = useSlice((s) => s.orders);
  const mine = useSlice((s) => s.myOrders);
  return orders.find((o) => o.id === id) || mine.find((o) => o.id === id) || null;
}

/** Loads all orders. Only works for a signed-in admin (the security rules hide them otherwise). */
export async function loadOrders() {
  if (!auth.session()) return fail('Sign in to see orders.');
  if (state.ordersStatus !== 'ready') setState({ ordersStatus: 'loading' });
  try {
    const rows = await db.select('orders', 'order=created_at.desc');
    setState({ orders: rows.map(fromOrderRow), ordersStatus: 'ready', ordersError: '' });
    return ok();
  } catch (e) {
    setState({ ordersStatus: state.ordersStatus === 'ready' ? 'ready' : 'error', ordersError: e.message });
    return fail(e);
  }
}

/**
 * Places an order for what's in the bag. The database checks stock, takes the prices from the
 * watches table and saves it (place_order in supabase/setup.sql).
 * Returns { ok, order } or { ok: false, error }.
 */
export async function placeOrder({ customer, shippingId, paymentId, newsletter }) {
  const items = state.cart
    .filter((l) => state.products.some((p) => p.id === l.id && p.active))
    .map((l) => ({ id: l.id, qty: l.qty }));
  if (!items.length) return fail('Your bag is empty.');
  try {
    const row = await db.rpc('place_order', {
      items,
      customer,
      shipping_id: shippingId,
      payment_id: paymentId,
      newsletter: !!newsletter,
    });
    const order = fromOrderRow(row);
    setState({ myOrders: [order, ...state.myOrders].slice(0, 20), cart: [] });
    loadCatalog(); // fresh stock for everyone browsing on this device
    return ok({ order });
  } catch (e) {
    loadCatalog(); // e.g. "only 1 left" — show the real stock now
    return fail(e);
  }
}

/** Changes an order's status (admin). Cancelling puts the watches back into stock. */
export async function updateOrderStatus(id, status) {
  try {
    const row = await db.rpc('set_order_status', { order_id: id, new_status: status });
    const order = fromOrderRow(row);
    setState({ orders: state.orders.map((o) => (o.id === id ? order : o)) });
    if (status === 'cancelled') loadCatalog(); // stock went back up
    return ok({ order });
  } catch (e) {
    return fail(e);
  }
}
