/**
 * TimeTag data store — catalog overrides (stock/price/visibility), orders and the cart.
 *
 * ⚠️  DEMO STORAGE: everything is saved in the visitor's browser (localStorage).
 *     Orders placed on one device are NOT visible on another. To go live, replace the
 *     functions marked "BACKEND" with calls to a real database (e.g. Supabase / Firebase).
 *     The rest of the app only talks to this file, so nothing else needs to change.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { PRODUCTS, WATCH_STYLES } from '../data/products.js';

const KEYS = {
  products: 'timetag:products', // watches added from the admin panel
  inventory: 'timetag:inventory',
  orders: 'timetag:orders',
  cart: 'timetag:cart',
};

export const LOW_STOCK = 3;
export const MAX_PER_ITEM = 5;

export const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard delivery', detail: '3–5 business days', price: 0 },
  { id: 'express', label: 'Express delivery', detail: '1–2 business days', price: 500 },
];

export const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery (COD)', detail: 'Pay in cash when your watch arrives.' },
  { id: 'bank', label: 'Bank transfer', detail: 'Account details are shown after you place the order.' },
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/* ---------------- persistence helpers ---------------- */
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
let state = {
  products: read(KEYS.products, []), // watches added in the admin
  inventory: read(KEYS.inventory, {}), // { [productId]: { stock, price, active, images, ...edits } }
  orders: read(KEYS.orders, []),
  cart: read(KEYS.cart, []), // [{ id, qty }]
  cartOpen: false,
};
const listeners = new Set();

const PERSISTED = ['products', 'inventory', 'orders', 'cart'];

function setState(patch) {
  state = { ...state, ...patch };
  for (const k of PERSISTED) if (k in patch) write(KEYS[k], state[k]);
  listeners.forEach((l) => l());
}

/** Like setState, but saves first and reports failure (e.g. browser storage full of photos). */
function commit(patch) {
  for (const k of PERSISTED) {
    if (!(k in patch)) continue;
    try {
      window.localStorage.setItem(KEYS[k], JSON.stringify(patch[k]));
    } catch (e) {
      const full = e && (e.name === 'QuotaExceededError' || e.code === 22);
      return {
        ok: false,
        error: full
          ? 'Browser storage is full. Remove some photos or use fewer/smaller images, then try again.'
          : 'Could not save changes in this browser.',
      };
    }
  }
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  return { ok: true };
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// keep several open tabs in sync (e.g. store in one tab, admin in another)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    const entry = Object.entries(KEYS).find(([, key]) => key === e.key);
    if (!entry) return;
    state = { ...state, [entry[0]]: read(e.key, entry[0] === 'inventory' ? {} : []) };
    listeners.forEach((l) => l());
  });
}

const useSlice = (pick) => useSyncExternalStore(subscribe, () => pick(state), () => pick(state));

/* ---------------- catalog ---------------- */
const BUILT_IN_IDS = new Set(PRODUCTS.map((p) => p.id));

function buildCatalog(inventory, custom) {
  // Newest admin-added watches first, then the built-in catalogue.
  return [...custom, ...PRODUCTS].map((p) => {
    const o = inventory[p.id] || {};
    const merged = { ...p, ...o };
    return {
      ...merged,
      custom: !BUILT_IN_IDS.has(p.id),
      images: merged.images || (merged.image ? [merged.image] : []),
      watch: WATCH_STYLES[merged.watchStyle] || p.watch || WATCH_STYLES.steelChrono,
      stock: merged.stock ?? 0,
      active: merged.active ?? true,
      gender: merged.gender || ['men', 'women'],
      tags: merged.tags || [],
    };
  });
}

/** All products (including hidden) with live stock/price. */
export function useCatalog() {
  const inventory = useSlice((s) => s.inventory);
  const custom = useSlice((s) => s.products);
  return useMemo(() => buildCatalog(inventory, custom), [inventory, custom]);
}

/** Products visible in the shop. */
export function useShopProducts() {
  const all = useCatalog();
  return useMemo(() => all.filter((p) => p.active), [all]);
}

export function getCatalog() {
  return buildCatalog(state.inventory, state.products);
}

/** Saves edits to any watch (price, stock, photos, text…). Returns { ok, error? }. */
export function updateProduct(id, patch) {
  // BACKEND: replace with an API call
  const current = state.inventory[id] || {};
  return commit({ inventory: { ...state.inventory, [id]: { ...current, ...patch } } });
}

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'watch';

/** Adds a new watch from the admin. Returns { ok, product } or { ok: false, error }. */
export function addProduct(data) {
  // BACKEND: replace with an API call (and upload photos to file storage)
  const taken = new Set(getCatalog().map((p) => p.id));
  let id = slug(data.name);
  for (let n = 2; taken.has(id); n++) id = `${slug(data.name)}-${n}`;
  const product = { rating: 5, active: true, ...data, id, createdAt: new Date().toISOString() };
  const res = commit({ products: [product, ...state.products] });
  return res.ok ? { ok: true, product } : res;
}

/** Permanently removes a watch that was added in the admin (built-in watches can only be hidden). */
export function deleteProduct(id) {
  if (BUILT_IN_IDS.has(id)) return { ok: false, error: 'Built-in watches can be hidden, not deleted.' };
  const inventory = { ...state.inventory };
  delete inventory[id];
  return commit({
    products: state.products.filter((p) => p.id !== id),
    inventory,
    cart: state.cart.filter((l) => l.id !== id),
  });
}

/** Approximate browser storage used by the shop, in bytes. */
export function storageUsed() {
  let bytes = 0;
  for (const key of Object.values(KEYS)) bytes += (window.localStorage.getItem(key) || '').length * 2;
  return bytes;
}

/* ---------------- cart ---------------- */
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
export function useOrders() {
  return useSlice((s) => s.orders);
}

export function useOrder(id) {
  const orders = useOrders();
  return orders.find((o) => o.id === id) || null;
}

/**
 * Creates an order from the current cart. Returns { ok, order } or { ok: false, error }.
 * BACKEND: in production this must happen on a server so stock and totals can't be faked.
 */
export function placeOrder({ customer, shippingId, paymentId, newsletter }) {
  const catalog = getCatalog();
  const lines = state.cart
    .map((l) => ({ line: l, product: catalog.find((p) => p.id === l.id) }))
    .filter((x) => x.product && x.product.active);

  if (!lines.length) return { ok: false, error: 'Your bag is empty.' };
  for (const { line, product } of lines) {
    if (line.qty > product.stock) {
      return { ok: false, error: `Sorry — only ${product.stock} left of ${product.name}. Please update your bag.` };
    }
  }

  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingId) || SHIPPING_METHODS[0];
  const payment = PAYMENT_METHODS.find((m) => m.id === paymentId) || PAYMENT_METHODS[0];
  const items = lines.map(({ line, product }) => ({
    id: product.id,
    name: product.name,
    collection: product.collection,
    price: product.price,
    qty: line.qty,
  }));
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const lastNumber = state.orders.reduce((n, o) => Math.max(n, o.number), 1000);
  const number = lastNumber + 1;

  const order = {
    id: `TT-${number}`,
    number,
    createdAt: new Date().toISOString(),
    status: 'pending',
    customer,
    newsletter: !!newsletter,
    shipping: { id: shipping.id, label: shipping.label, detail: shipping.detail, price: shipping.price },
    payment: { id: payment.id, label: payment.label },
    items,
    subtotal,
    total: subtotal + shipping.price,
  };

  const inventory = { ...state.inventory };
  for (const item of items) {
    const p = catalog.find((x) => x.id === item.id);
    inventory[item.id] = { ...(inventory[item.id] || {}), stock: p.stock - item.qty };
  }

  setState({ orders: [order, ...state.orders], inventory, cart: [] });
  return { ok: true, order };
}

/** Changes an order's status. Cancelling puts the items back into stock. */
export function updateOrderStatus(id, status) {
  const order = state.orders.find((o) => o.id === id);
  if (!order || order.status === status) return;
  if (order.status === 'cancelled') return; // cancelled orders are final

  let inventory = state.inventory;
  if (status === 'cancelled') {
    inventory = { ...inventory };
    const catalog = getCatalog();
    for (const item of order.items) {
      const p = catalog.find((x) => x.id === item.id);
      if (p) inventory[item.id] = { ...(inventory[item.id] || {}), stock: p.stock + item.qty };
    }
  }
  const orders = state.orders.map((o) =>
    o.id === id ? { ...o, status, history: [...(o.history || []), { status, at: new Date().toISOString() }] } : o
  );
  setState({ orders, inventory });
}

/** Clears all demo orders and stock changes in this browser. */
export function resetDemoData() {
  setState({ products: [], inventory: {}, orders: [], cart: [] });
}
