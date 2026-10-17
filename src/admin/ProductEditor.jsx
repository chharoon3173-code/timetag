import { useEffect, useRef, useState } from 'react';
import Watch from '../components/Watch.jsx';
import { WATCH_STYLES, formatPrice } from '../data/products.js';
import { addProduct, deleteProduct, updateProduct, useCollections } from '../lib/store.js';
import { MAX_PHOTOS, compressImage, dataUrlKB } from '../lib/images.js';

const STYLE_OPTIONS = [
  ['steelChrono', 'Steel chronograph, black dial'],
  ['heritageGold', 'Gold, ivory dial'],
  ['midnight', 'Steel bracelet, midnight dial'],
  ['champagne', 'Steel bracelet, champagne dial'],
  ['noir', 'All black chronograph'],
  ['verdant', 'Gold, green dial'],
];

const BLANK = {
  name: '',
  collectionIds: [], // ticked in the form (at least one)
  original: '', // original price (required)
  sale: '', // discounted price — what customers pay (optional)
  stock: '',
  badge: '',
  description: '',
  strap: '',
  gender: ['men'],
  tags: ['new'],
  watchStyle: 'steelChrono',
  images: [],
  active: true,
};

function fromProduct(p) {
  return {
    name: p.name,
    collectionIds: p.collectionIds || [],
    // a discounted watch has originalPrice above price
    original: String(p.originalPrice > p.price ? p.originalPrice : p.price),
    sale: p.originalPrice > p.price ? String(p.price) : '',
    stock: String(p.stock),
    badge: p.badge || '',
    description: p.description || '',
    strap: p.strap || '',
    gender: p.gender || [],
    tags: p.tags || [],
    watchStyle: p.watchStyle || Object.keys(WATCH_STYLES).find((k) => WATCH_STYLES[k] === p.watch) || 'steelChrono',
    images: p.images || [],
    active: p.active,
  };
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function ProductEditor({ product, onClose, onSaved }) {
  const isNew = !product;
  const collections = useCollections();
  const [f, setF] = useState(() => (product ? fromProduct(product) : BLANK));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(''); // '' | 'save' | 'delete' while talking to the database
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (key, value) => {
    setF((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function addFiles(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    const room = MAX_PHOTOS - f.images.length;
    if (room <= 0) {
      setPhotoMsg(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    setBusy(true);
    setPhotoMsg(`Preparing ${Math.min(room, files.length)} photo(s)…`);
    const added = [];
    const problems = [];
    for (const file of files.slice(0, room)) {
      try {
        added.push(await compressImage(file));
      } catch (e) {
        problems.push(e.message);
      }
    }
    setF((s) => ({ ...s, images: [...s.images, ...added] }));
    setBusy(false);
    const skipped = files.length > room ? ` ${files.length - room} skipped (max ${MAX_PHOTOS}).` : '';
    setPhotoMsg(problems.length ? problems.join(' ') + skipped : added.length ? `${added.length} photo(s) added.${skipped}` : skipped);
    if (errors.images) setErrors((e) => ({ ...e, images: undefined }));
  }

  const movePhoto = (i, dir) =>
    setF((s) => {
      const imgs = [...s.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return s;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...s, images: imgs };
    });
  const makeMain = (i) => setF((s) => ({ ...s, images: [s.images[i], ...s.images.filter((_, k) => k !== i)] }));
  const removePhoto = (i) => setF((s) => ({ ...s, images: s.images.filter((_, k) => k !== i) }));

  function validate() {
    const e = {};
    if (!f.name.trim()) e.name = 'Enter a name';
    if (!collections.some((c) => f.collectionIds.includes(c.id))) e.collectionIds = 'Tick at least one collection';
    const original = Number(f.original);
    if (!f.original || !Number.isFinite(original) || original <= 0) e.original = 'Enter a price above 0';
    const sale = Number(f.sale);
    if (f.sale && (!Number.isFinite(sale) || sale <= 0)) e.sale = 'Enter a price above 0, or leave empty';
    else if (f.sale && original > 0 && sale >= original) e.sale = 'Must be lower than the original price';
    const stock = Number(f.stock);
    if (f.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'Enter stock (0 or more)';
    if (!f.description.trim()) e.description = 'Add a short description';
    if (!f.gender.length) e.gender = 'Choose at least one';
    return e;
  }

  async function save(e) {
    e.preventDefault();
    if (saving) return;
    setSaveError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const data = {
      name: f.name.trim(),
      // in your collection order, so the first one (shown on the card) is predictable
      collectionIds: collections.filter((c) => f.collectionIds.includes(c.id)).map((c) => c.id),
      // customers pay the discounted price if there is one; the original is then shown crossed out
      price: Math.round(Number(f.sale || f.original)),
      originalPrice: f.sale ? Math.round(Number(f.original)) : null,
      stock: Number(f.stock),
      badge: f.badge.trim(),
      description: f.description.trim(),
      strap: f.strap.trim(),
      gender: f.gender,
      tags: f.tags,
      watchStyle: f.watchStyle,
      images: f.images,
      active: f.active,
    };
    setSaving('save'); // new photos are uploaded first, so this can take a few seconds
    const res = isNew ? await addProduct(data) : await updateProduct(product.id, data);
    setSaving('');
    if (!res.ok) {
      setSaveError(res.error);
      return;
    }
    onSaved(isNew ? `${data.name} added to the store` : `${data.name} saved`);
    onClose();
  }

  async function remove() {
    if (saving) return;
    if (!window.confirm(`Delete “${product.name}” permanently? This can’t be undone. Past orders keep their own copy of its name and price.`)) return;
    setSaving('delete');
    const res = await deleteProduct(product.id);
    setSaving('');
    if (!res.ok) {
      setSaveError(res.error);
      return;
    }
    onSaved(`${product.name} deleted`);
    onClose();
  }

  // photos picked but not uploaded yet are "data:" addresses
  const newKB = f.images.filter((d) => d.startsWith('data:')).reduce((n, d) => n + dataUrlKB(d), 0);

  return (
    <div className="adm-panel-wrap" onClick={onClose}>
      <form className="adm-panel adm-editor" role="dialog" aria-modal="true" aria-label={isNew ? 'Add watch' : `Edit ${product.name}`} onClick={(e) => e.stopPropagation()} onSubmit={save} noValidate>
        <header className="adm-panel__head">
          <div>
            <h2>{isNew ? 'Add a watch' : 'Edit watch'}</h2>
            <small>{isNew ? 'It appears in the store as soon as you save.' : product.name}</small>
          </div>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Close">×</button>
        </header>

        {/* ---- Photos ---- */}
        <section>
          <h3>Photos <span className="adm-muted">({f.images.length}/{MAX_PHOTOS})</span></h3>
          <div
            className={`adm-drop${dragOver ? ' is-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 8" /></svg>
            <p><strong>Drag photos here</strong> or</p>
            <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={busy || f.images.length >= MAX_PHOTOS}>
              {busy ? 'Preparing…' : 'Choose photos'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            <small>JPG, PNG or WebP · up to {MAX_PHOTOS} · first photo is the main one</small>
          </div>
          {photoMsg && <p className="adm-note" role="status">{photoMsg}</p>}

          {f.images.length > 0 ? (
            <ul className="adm-photos">
              {f.images.map((src, i) => (
                <li key={i} className={i === 0 ? 'is-main' : ''}>
                  <img src={src} alt={`Photo ${i + 1}`} />
                  {i === 0 && <span className="adm-photos__main">Main</span>}
                  <div className="adm-photos__tools">
                    <button type="button" onClick={() => movePhoto(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} left`}>←</button>
                    {i !== 0 && <button type="button" onClick={() => makeMain(i)} aria-label={`Make photo ${i + 1} the main photo`}>Main</button>}
                    <button type="button" onClick={() => movePhoto(i, 1)} disabled={i === f.images.length - 1} aria-label={`Move photo ${i + 1} right`}>→</button>
                    <button type="button" onClick={() => removePhoto(i)} aria-label={`Remove photo ${i + 1}`}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-fallback">
              <span className="adm-thumb adm-thumb--lg"><Watch style={WATCH_STYLES[f.watchStyle]} /></span>
              <label className="adm-field">
                <span>Until you add photos, show this drawing</span>
                <select className="adm-input" value={f.watchStyle} onChange={(e) => set('watchStyle', e.target.value)}>
                  {STYLE_OPTIONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </label>
            </div>
          )}
          {f.images.length > 0 && (
            <p className="adm-note">
              Photos are resized automatically{newKB > 0 && ` · ${newKB} KB to upload when you save`}
            </p>
          )}
        </section>

        {/* ---- Details ---- */}
        <section className="adm-form">
          <h3>Details</h3>
          <label className="adm-field">
            <span>Watch name *</span>
            <input className={`adm-input${errors.name ? ' is-error' : ''}`} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Royal Steel 40" />
            {errors.name && <em>{errors.name}</em>}
          </label>
          <div className="adm-form__row">
            <label className="adm-field">
              <span>Original price (Rs.) *</span>
              <input className={`adm-input${errors.original ? ' is-error' : ''}`} inputMode="numeric" value={f.original} onChange={(e) => set('original', e.target.value.replace(/[^\d]/g, ''))} placeholder="4500" />
              {errors.original && <em>{errors.original}</em>}
            </label>
            <label className="adm-field">
              <span>Discounted price (Rs.) — optional</span>
              <input className={`adm-input${errors.sale ? ' is-error' : ''}`} inputMode="numeric" value={f.sale} onChange={(e) => set('sale', e.target.value.replace(/[^\d]/g, ''))} placeholder="Leave empty if no discount" />
              {errors.sale && <em>{errors.sale}</em>}
            </label>
          </div>
          {Number(f.original) > 0 && (
            <p className="adm-note adm-price-preview">
              Customers see: <strong>{formatPrice(Number(f.sale) > 0 && Number(f.sale) < Number(f.original) ? Number(f.sale) : Number(f.original))}</strong>
              {Number(f.sale) > 0 && Number(f.sale) < Number(f.original) && (
                <> <s>{formatPrice(Number(f.original))}</s> · {Math.round((1 - Number(f.sale) / Number(f.original)) * 100)}% off</>
              )}
            </p>
          )}
          <fieldset className="adm-checks">
            <legend>Collections * (tick every one it belongs to, e.g. Rolex and Automatic Watches)</legend>
            {collections.map((c) => (
              <label key={c.id}>
                <input type="checkbox" checked={f.collectionIds.includes(c.id)} onChange={() => set('collectionIds', toggle(f.collectionIds, c.id))} /> {c.title}
              </label>
            ))}
            {errors.collectionIds && <em>{errors.collectionIds}</em>}
          </fieldset>
          <div className="adm-form__row">
            <label className="adm-field">
              <span>Stock *</span>
              <input className={`adm-input${errors.stock ? ' is-error' : ''}`} inputMode="numeric" value={f.stock} onChange={(e) => set('stock', e.target.value.replace(/[^\d]/g, ''))} placeholder="10" />
              {errors.stock && <em>{errors.stock}</em>}
            </label>
            <label className="adm-field">
              <span>Label on card (optional)</span>
              <input className="adm-input" value={f.badge} onChange={(e) => set('badge', e.target.value)} placeholder="e.g. Limited Edition" />
            </label>
          </div>
          <label className="adm-field">
            <span>Short description *</span>
            <textarea className={`adm-input adm-textarea${errors.description ? ' is-error' : ''}`} rows={3} maxLength={220} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="One or two elegant sentences about the watch." />
            {errors.description && <em>{errors.description}</em>}
          </label>
          <label className="adm-field">
            <span>Strap / bracelet (optional)</span>
            <input className="adm-input" value={f.strap} onChange={(e) => set('strap', e.target.value)} placeholder="e.g. Brown leather strap" />
          </label>

          <fieldset className="adm-checks">
            <legend>For *</legend>
            <label><input type="checkbox" checked={f.gender.includes('men')} onChange={() => set('gender', toggle(f.gender, 'men'))} /> Men</label>
            <label><input type="checkbox" checked={f.gender.includes('women')} onChange={() => set('gender', toggle(f.gender, 'women'))} /> Women</label>
            {errors.gender && <em>{errors.gender}</em>}
          </fieldset>
          <fieldset className="adm-checks">
            <legend>Show under</legend>
            <label><input type="checkbox" checked={f.tags.includes('new')} onChange={() => set('tags', toggle(f.tags, 'new'))} /> New Arrivals</label>
            <label><input type="checkbox" checked={f.tags.includes('best')} onChange={() => set('tags', toggle(f.tags, 'best'))} /> Best Sellers</label>
          </fieldset>
          <label className="adm-check-row">
            <span className="adm-switch">
              <input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} />
              <span aria-hidden="true" />
            </span>
            Visible in the store
          </label>
        </section>

        {saveError && <p className="adm-save-err" role="alert">{saveError}</p>}

        <footer className="adm-editor__foot">
          {!isNew && (
            <button type="button" className="adm-btn adm-btn--danger" onClick={remove} disabled={!!saving}>
              {saving === 'delete' ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn adm-btn--gold" disabled={busy || !!saving}>
            {saving === 'save' ? 'Saving…' : isNew ? 'Add watch' : 'Save changes'}
          </button>
        </footer>
      </form>
    </div>
  );
}
