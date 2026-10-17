import { useRef, useState } from 'react';
import { ProductVisual } from '../components/Watch.jsx';
import ProductEditor from './ProductEditor.jsx';
import { LOW_STOCK, updateProduct } from '../lib/store.js';
import { href } from '../lib/router.js';
import { formatPrice } from './shared.jsx';

/** Saves one change to a watch and reports the result in the toast. */
async function save(product, patch, message, onSaved) {
  const res = await updateProduct(product.id, patch);
  onSaved(res.ok ? message : `Couldn’t save ${product.name}: ${res.error}`);
}

function PriceInput({ product, onSaved }) {
  const [value, setValue] = useState(String(product.price));
  const commit = () => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n <= 0) {
      setValue(String(product.price));
      return;
    }
    if (n !== product.price) save(product, { price: n }, `${product.name}: price set to ${formatPrice(n)}`, onSaved);
  };
  return (
    <div className="adm-money">
      <span>Rs.</span>
      <input
        className="adm-input"
        inputMode="numeric"
        aria-label={`Price for ${product.name}`}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </div>
  );
}

function StockControl({ product, onSaved }) {
  const set = (n) => {
    const v = Math.max(0, Math.min(9999, n));
    save(product, { stock: v }, `${product.name}: stock set to ${v}`, onSaved);
  };
  return (
    <div className="adm-stock">
      <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => set(product.stock - 1)} disabled={product.stock <= 0}>−</button>
      <input
        className="adm-input"
        inputMode="numeric"
        aria-label={`Stock for ${product.name}`}
        value={product.stock}
        onChange={(e) => set(Number(e.target.value.replace(/[^\d]/g, '')) || 0)}
      />
      <button type="button" aria-label={`Add one ${product.name}`} onClick={() => set(product.stock + 1)}>+</button>
    </div>
  );
}

export default function Inventory({ catalog }) {
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product id
  const toastTimer = useRef(null); // kept between renders, so a new message cancels the old one's timer
  const saved = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), msg.startsWith('Couldn’t') ? 6000 : 2200);
  };

  return (
    <>
      <header className="adm-head">
        <h1>Inventory <span className="adm-count">{catalog.length} watches</span></h1>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--gold" onClick={() => setEditing('new')}>+ Add watch</button>
        </div>
      </header>
      <p className="adm-hint">Price, stock and visibility save straight away. Click <strong>Edit</strong> to change photos, name, collection or description.</p>

      <section className="adm-card adm-card--flush">
        <div className="adm-scroll">
          <table className="adm-table adm-inv">
            <thead><tr><th>Watch</th><th>Price</th><th>Stock</th><th>Status</th><th>Visible</th><th><span className="sr-only">Edit</span></th></tr></thead>
            <tbody>
              {catalog.map((p) => {
                const state = p.stock <= 0 ? ['out', 'Sold out'] : p.stock <= LOW_STOCK ? ['low', 'Low stock'] : ['ok', 'In stock'];
                return (
                  <tr key={p.id} className={p.active ? '' : 'is-hidden'}>
                    <td>
                      <div className="adm-prod">
                        <span className="adm-thumb"><ProductVisual product={p} /></span>
                        <span>
                          <a href={href(`/product/${p.id}`)} target="_blank" rel="noreferrer">{p.name}</a>
                          <small>{p.collectionNames.join(', ') || <span className="adm-nocol">No collection</span>}{p.images.length > 0 && ` · ${p.images.length} photo${p.images.length > 1 ? 's' : ''}`}</small>
                        </span>
                      </div>
                    </td>
                    <td><PriceInput key={p.price} product={p} onSaved={saved} /></td>
                    <td><StockControl product={p} onSaved={saved} /></td>
                    <td><span className={`adm-pill adm-pill--stock-${state[0]}`}>{state[1]}</span></td>
                    <td>
                      <label className="adm-switch">
                        <input
                          type="checkbox"
                          checked={p.active}
                          onChange={(e) => save(p, { active: e.target.checked }, `${p.name} is now ${e.target.checked ? 'visible' : 'hidden'}`, saved)}
                        />
                        <span aria-hidden="true" />
                        <em className="sr-only">Show {p.name} in store</em>
                      </label>
                    </td>
                    <td><button type="button" className="adm-btn adm-btn--sm" onClick={() => setEditing(p.id)}>Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {catalog.length === 0 && <p className="adm-empty">No watches yet — click “Add watch”.</p>}

      {editing && (
        <ProductEditor
          product={editing === 'new' ? null : catalog.find((p) => p.id === editing)}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}

      <div className={`adm-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
