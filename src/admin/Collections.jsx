import { useRef, useState } from 'react';
import { ProductVisual } from '../components/Watch.jsx';
import CollectionEditor from './CollectionEditor.jsx';
import { MAX_SIGNATURE, setSignatureSlots, useCollections, useSignatureSlots } from '../lib/store.js';
import { href } from '../lib/router.js';

const pad = (n) => String(n).padStart(2, '0');

/** Admin → Collections: the Signature Collection picks, and the list of collections. */
export default function Collections({ catalog, onOpenInventory }) {
  const collections = useCollections();
  const slots = useSignatureSlots();
  const [editing, setEditing] = useState(null); // null | 'new' | collection id
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null); // kept between renders, so a new message cancels the old one's timer

  const saved = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const countIn = (id) => catalog.filter((p) => p.collectionId === id).length;
  const uncategorized = catalog.filter((p) => !p.collectionId);
  const picked = slots.filter(Boolean);
  const editingCollection = editing && editing !== 'new' ? collections.find((c) => c.id === editing) : null;

  const pick = (i, id) => {
    const next = [...slots];
    next[i] = id;
    const res = setSignatureSlots(next);
    if (!res.ok) return saved(res.error);
    const p = catalog.find((x) => x.id === id);
    saved(p ? `Slot ${pad(i + 1)}: ${p.name}` : `Slot ${pad(i + 1)} cleared`);
  };

  return (
    <>
      <header className="adm-head">
        <h1>Collections <span className="adm-count">{collections.length} collections</span></h1>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--gold" onClick={() => setEditing('new')}>+ Add collection</button>
        </div>
      </header>

      {/* ---------- Signature Collection ---------- */}
      <section className="adm-card adm-sig" aria-labelledby="adm-sig-title">
        <div className="adm-card__head">
          <h2 id="adm-sig-title">Signature Collection</h2>
          <a className="adm-linkbtn" href={href('/')} target="_blank" rel="noreferrer">See it on the home page ↗</a>
        </div>
        <p className="adm-hint adm-sig__hint">
          The watches in the “Our Signature Collection” dial on the home page. Pick up to {MAX_SIGNATURE}; slot 01 is shown first.
        </p>

        <ol className="adm-sig__slots">
          {slots.map((id, i) => {
            const product = catalog.find((p) => p.id === id);
            const taken = new Set(slots.filter((s, k) => s && k !== i));
            return (
              <li key={i} className={`adm-sig__slot${product ? '' : ' is-empty'}`}>
                <span className="adm-sig__no">{pad(i + 1)}</span>
                <span className="adm-sig__thumb">
                  {product ? <ProductVisual product={product} /> : <span aria-hidden="true">+</span>}
                </span>
                <label className="sr-only" htmlFor={`adm-sig-${i}`}>Watch for slot {pad(i + 1)}</label>
                <select id={`adm-sig-${i}`} className="adm-input" value={product ? id : ''} onChange={(e) => pick(i, e.target.value)}>
                  <option value="">— Empty —</option>
                  {catalog.map((p) => (
                    <option key={p.id} value={p.id} disabled={taken.has(p.id)}>
                      {p.name}{!p.active ? ' (hidden)' : p.stock <= 0 ? ' (sold out)' : ''}{taken.has(p.id) ? ' — in another slot' : ''}
                    </option>
                  ))}
                </select>
                {product && !product.active && <em className="adm-sig__warn">Hidden in the store, so it won’t show in the dial.</em>}
              </li>
            );
          })}
        </ol>
        {picked.length === 0 && (
          <p className="adm-note">Nothing picked yet, so the dial shows your first {MAX_SIGNATURE} Best Sellers.</p>
        )}
      </section>

      {/* ---------- watches without a collection ---------- */}
      {uncategorized.length > 0 && (
        <div className="adm-alert" role="note">
          <strong>{uncategorized.length} watch{uncategorized.length > 1 ? 'es have' : ' has'} no collection:</strong>{' '}
          {uncategorized.map((p) => p.name).join(', ')}.{' '}
          <button type="button" className="adm-linkbtn" onClick={onOpenInventory}>Choose one in Inventory → Edit</button>
        </div>
      )}

      {/* ---------- the collections ---------- */}
      <section className="adm-card adm-card--flush">
        {collections.length === 0 ? (
          <p className="adm-empty">No collections yet. Click “Add collection”.</p>
        ) : (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>Collection</th><th>Watches</th><th><span className="sr-only">Edit</span></th></tr></thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="adm-prod">
                        <span className="adm-logo">{c.image ? <img src={c.image} alt="" /> : c.mark}</span>
                        <span>
                          <strong className="adm-strong">{c.title}</strong>
                          <small>{c.image ? 'Logo' : 'No logo: showing initials'}</small>
                        </span>
                      </div>
                    </td>
                    <td>{countIn(c.id)}</td>
                    <td className="adm-td-end">
                      <button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(c.id)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="adm-note">Collections show on the home page (“Shop by Collection”) and in the footer, in this order.</p>

      {editing && (
        <CollectionEditor
          collection={editingCollection}
          watchCount={editingCollection ? countIn(editingCollection.id) : 0}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}

      <div className={`adm-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
