import { useState } from 'react';
import { ProductVisual } from '../components/Watch.jsx';
import ProductEditor from './ProductEditor.jsx';
import { LOW_STOCK, resetDemoData, storageUsed, updateProduct } from '../lib/store.js';
import { href } from '../lib/router.js';
import { formatPrice } from './shared.jsx';

function PriceInput({ product, onSaved }) {
  const [value, setValue] = useState(String(product.price));
  const commit = () => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n <= 0) {
      setValue(String(product.price));
      return;
    }
    if (n !== product.price) {
      updateProduct(product.id, { price: n });
      onSaved(`${product.name}: price set to ${formatPrice(n)}`);
    }
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
    updateProduct(product.id, { stock: v });
    onSaved(`${product.name}: stock set to ${v}`);
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

const STORAGE_LIMIT_MB = 5; // typical browser limit for one website

function StorageMeter() {
  const mb = storageUsed() / 1024 / 1024;
  const pct = Math.min(100, (mb / STORAGE_LIMIT_MB) * 100);
  return (
    <div className="adm-meter" title="Photos and orders are stored in this browser until a database is connected">
      <span>Browser storage</span>
      <div className="adm-meter__bar"><i style={{ width: `${pct}%` }} className={pct > 80 ? 'is-high' : ''} /></div>
      <small>{mb.toFixed(1)} of ~{STORAGE_LIMIT_MB} MB</small>
    </div>
  );
}

export default function Inventory({ catalog }) {
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product id
  const saved = (msg) => {
    setToast(msg);
    clearTimeout(saved.t);
    saved.t = setTimeout(() => setToast(''), 2200);
  };

  return (
    <>
      <header className="adm-head">
        <h1>Inventory <span className="adm-count">{catalog.length} watches</span></h1>
        <div className="adm-head__actions">
        <button type="button" className="adm-btn adm-btn--gold" onClick={() => setEditing('new')}>+ Add watch</button>
        <button
          type="button"
          className="adm-btn adm-btn--ghost"
          onClick={() => {
            if (window.confirm('Reset everything in this browser? This removes watches you added, test orders, and all stock/price changes.')) {
              resetDemoData();
              saved('Demo data reset');
            }
          }}
        >
          Reset demo data
        </button>
        </div>
      </header>
      <div className="adm-subbar">
        <p className="adm-hint">Price, stock and visibility save instantly. Click <strong>Edit</strong> to change photos, name or description.</p>
        <StorageMeter />
      </div>

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
                          <small>{p.collection || <span className="adm-nocol">No collection</span>}{p.custom && ' · added by you'}{p.images.length > 0 && ` · ${p.images.length} photo${p.images.length > 1 ? 's' : ''}`}</small>
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
                          onChange={(e) => {
                            updateProduct(p.id, { active: e.target.checked });
                            saved(`${p.name} is now ${e.target.checked ? 'visible' : 'hidden'}`);
                          }}
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
