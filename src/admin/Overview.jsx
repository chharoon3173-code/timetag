import { LOW_STOCK } from '../lib/store.js';
import { StatusPill, customerName, fmtDate, formatPrice } from './shared.jsx';

export default function Overview({ orders, catalog, onOpenOrder, onGo }) {
  const live = orders.filter((o) => o.status !== 'cancelled');
  const revenue = live.reduce((n, o) => n + o.total, 0);
  const pending = orders.filter((o) => o.status === 'pending');
  const lowStock = catalog.filter((p) => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
  const unitsInStock = catalog.reduce((n, p) => n + Math.max(0, p.stock), 0);

  const stats = [
    { label: 'Total orders', value: orders.length },
    { label: 'Revenue', value: formatPrice(revenue), note: 'excl. cancelled' },
    { label: 'Pending orders', value: pending.length, alert: pending.length > 0 },
    { label: 'Watches in stock', value: unitsInStock, note: `${lowStock.length} low or sold out` },
  ];

  return (
    <>
      <header className="adm-head">
        <h1>Overview</h1>
      </header>

      <div className="adm-stats">
        {stats.map((s) => (
          <div key={s.label} className={`adm-stat${s.alert ? ' adm-stat--alert' : ''}`}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            {s.note && <small>{s.note}</small>}
          </div>
        ))}
      </div>

      <div className="adm-cols">
        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Recent orders</h2>
            <button type="button" className="adm-linkbtn" onClick={() => onGo('orders')}>View all →</button>
          </div>
          {orders.length === 0 ? (
            <p className="adm-empty">No orders yet. Place a test order on the store to see it here.</p>
          ) : (
            <table className="adm-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="adm-row" onClick={() => onOpenOrder(o.id)}>
                    <td><button type="button" className="adm-linkbtn" onClick={(e) => { e.stopPropagation(); onOpenOrder(o.id); }}>{o.id}</button><small>{fmtDate(o.createdAt)}</small></td>
                    <td>{customerName(o)}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td><StatusPill status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Low stock</h2>
            <button type="button" className="adm-linkbtn" onClick={() => onGo('inventory')}>Manage →</button>
          </div>
          {lowStock.length === 0 ? (
            <p className="adm-empty">All watches are well stocked.</p>
          ) : (
            <ul className="adm-low">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <strong className={p.stock <= 0 ? 'is-out' : ''}>{p.stock <= 0 ? 'Sold out' : `${p.stock} left`}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
