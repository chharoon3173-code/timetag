import { useEffect, useRef, useState } from 'react';
import Watch from '../components/Watch.jsx';
import { COLLECTIONS, WATCH_STYLES } from '../data/products.js';
import { addProduct, deleteProduct, updateProduct } from '../lib/store.js';
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
  collection: COLLECTIONS[0].title,
  price: '',
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
    collection: p.collection,
    price: String(p.price),
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
  const [f, setF] = useState(() => (product ? fromProduct(product) : BLANK));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');
  const [saveError, setSaveError] = useState('');
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
    const price = Number(f.price);
    if (!f.price || !Number.isFinite(price) || price <= 0) e.price = 'Enter a price above 0';
    const stock = Number(f.stock);
    if (f.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'Enter stock (0 or more)';
    if (!f.description.trim()) e.description = 'Add a short description';
    if (!f.gender.length) e.gender = 'Choose at least one';
    return e;
  }

  function save(e) {
    e.preventDefault();
    setSaveError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const data = {
      name: f.name.trim(),
      collection: f.collection,
      price: Math.round(Number(f.price)),
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
    const res = isNew ? addProduct(data) : updateProduct(product.id, data);
    if (!res.ok) {
      setSaveError(res.error);
      return;
    }
    onSaved(isNew ? `${data.name} added to the store` : `${data.name} saved`);
    onClose();
  }

  function remove() {
    if (!window.confirm(`Delete “${product.name}” permanently? This can’t be undone.`)) return;
    const res = deleteProduct(product.id);
    if (!res.ok) {
      setSaveError(res.error);
      return;
    }
    onSaved(`${product.name} deleted`);
    onClose();
  }

  const totalKB = f.images.reduce((n, d) => n + dataUrlKB(d), 0);

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
          {f.images.length > 0 && <p className="adm-note">Photos are resized automatically · {totalKB} KB total</p>}
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
              <span>Price (Rs.) *</span>
              <input className={`adm-input${errors.price ? ' is-error' : ''}`} inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="49999" />
              {errors.price && <em>{errors.price}</em>}
            </label>
            <label className="adm-field">
              <span>Stock *</span>
              <input className={`adm-input${errors.stock ? ' is-error' : ''}`} inputMode="numeric" value={f.stock} onChange={(e) => set('stock', e.target.value.replace(/[^\d]/g, ''))} placeholder="10" />
              {errors.stock && <em>{errors.stock}</em>}
            </label>
          </div>
          <div className="adm-form__row">
            <label className="adm-field">
              <span>Collection</span>
              <select className="adm-input" value={f.collection} onChange={(e) => set('collection', e.target.value)}>
                {COLLECTIONS.map((c) => <option key={c.id}>{c.title}</option>)}
              </select>
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
          {!isNew && product.custom && (
            <button type="button" className="adm-btn adm-btn--danger" onClick={remove}>Delete</button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn adm-btn--gold" disabled={busy}>{isNew ? 'Add watch' : 'Save changes'}</button>
        </footer>
      </form>
    </div>
  );
}
