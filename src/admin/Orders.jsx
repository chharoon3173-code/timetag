import { useEffect, useMemo, useState } from 'react';
import { ProductVisual } from '../components/Watch.jsx';
import { ORDER_STATUSES, loadOrders, updateOrderStatus, useOrdersStatus } from '../lib/store.js';
import { STATUS_LABEL, StatusPill, customerName, fmtDate, formatPrice, itemCount } from './shared.jsx';

function downloadCSV(orders) {
  const head = ['Order', 'Date', 'Status', 'Customer', 'Contact', 'Phone', 'Address', 'City', 'Items', 'Shipping', 'Payment', 'Total (PKR)'];
  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toLocaleString('en-PK'),
    STATUS_LABEL[o.status],
    customerName(o),
    o.customer.contact,
    o.customer.phone,
    [o.customer.address, o.customer.apartment].filter(Boolean).join(', '),
    o.customer.city,
    o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
    o.shipping.label,
    o.payment.label,
    o.total,
  ]);
  const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `timetag-orders-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

function StatusSelect({ order }) {
  const [saving, setSaving] = useState(false);
  const locked = order.status === 'cancelled';
  return (
    <select
      className={`adm-select adm-select--${order.status}`}
      value={order.status}
      disabled={locked || saving}
      aria-label={`Status for ${order.id}`}
      aria-busy={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={async (e) => {
        const next = e.target.value;
        if (next === 'cancelled' && !window.confirm(`Cancel ${order.id}? Its items will go back into stock. This can't be undone.`)) return;
        setSaving(true);
        const res = await updateOrderStatus(order.id, next);
        setSaving(false);
        if (!res.ok) window.alert(`Couldn’t change ${order.id}: ${res.error}`);
      }}
    >
      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
    </select>
  );
}

function OrderPanel({ order, catalog, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const c = order.customer;
  const address = [c.address, c.apartment, `${c.city}${c.postal ? ' ' + c.postal : ''}`, c.country].filter(Boolean).join(', ');

  return (
    <div className="adm-panel-wrap" onClick={onClose}>
      <aside className="adm-panel" role="dialog" aria-modal="true" aria-label={`Order ${order.id}`} onClick={(e) => e.stopPropagation()}>
        <header className="adm-panel__head">
          <div>
            <h2>{order.id}</h2>
            <small>{new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</small>
          </div>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="adm-panel__status">
          <span>Status</span>
          <StatusSelect order={order} />
        </div>

        <section>
          <h3>Items</h3>
          <ul className="adm-items">
            {order.items.map((i) => {
              const product = catalog.find((p) => p.id === i.id);
              return (
                <li key={i.id}>
                  <span className="adm-thumb">{product && <ProductVisual product={product} />}</span>
                  <span>{i.name}<small>{i.qty} × {formatPrice(i.price)}</small></span>
                  <strong>{formatPrice(i.qty * i.price)}</strong>
                </li>
              );
            })}
          </ul>
          <dl className="adm-sum">
            <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div><dt>{order.shipping.label}</dt><dd>{order.shipping.price ? formatPrice(order.shipping.price) : 'Free'}</dd></div>
            <div className="adm-sum__total"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>

        <section>
          <h3>Customer</h3>
          <p><strong>{customerName(order)}</strong><br />{c.contact}<br />{c.phone}</p>
          <div className="adm-actions">
            <a className="adm-btn" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>Call</a>
            <a className="adm-btn" href={`https://wa.me/${c.phone.replace(/\D/g, '').replace(/^0/, '92')}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <button type="button" className="adm-btn" onClick={() => navigator.clipboard?.writeText(`${customerName(order)}\n${address}\n${c.phone}`)}>Copy address</button>
          </div>
        </section>

        <section>
          <h3>Shipping address</h3>
          <p>{address}</p>
        </section>

        <section>
          <h3>Payment</h3>
          <p>{order.payment.label}</p>
          {order.newsletter && <p className="adm-muted">Subscribed to news &amp; offers</p>}
        </section>

        {order.history?.length > 0 && (
          <section>
            <h3>History</h3>
            <ul className="adm-history">
              <li>Placed · {fmtDate(order.createdAt)}</li>
              {order.history.map((h, i) => <li key={i}>{STATUS_LABEL[h.status]} · {fmtDate(h.at)}</li>)}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

export default function Orders({ orders, catalog, openId, setOpenId }) {
  const status = useOrdersStatus();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c = { all: orders.length };
    for (const s of ORDER_STATUSES) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q || [o.id, customerName(o), o.customer.phone, o.customer.contact, o.customer.city].join(' ').toLowerCase().includes(q))
    );
  }, [orders, filter, query]);

  const open = orders.find((o) => o.id === openId);

  return (
    <>
      <header className="adm-head">
        <h1>Orders</h1>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn" onClick={loadOrders} disabled={status === 'loading'}>
            {status === 'loading' ? 'Loading…' : 'Refresh'}
          </button>
          <button type="button" className="adm-btn" onClick={() => downloadCSV(shown)} disabled={!shown.length}>Export CSV</button>
        </div>
      </header>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter by status">
          {['all', ...ORDER_STATUSES].map((s) => (
            <button key={s} type="button" role="tab" aria-selected={filter === s} className={filter === s ? 'is-active' : ''} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS_LABEL[s]} <span>{counts[s]}</span>
            </button>
          ))}
        </div>
        <input className="adm-input adm-search" type="search" placeholder="Search order, name, phone…" aria-label="Search orders" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <section className="adm-card adm-card--flush">
        {shown.length === 0 ? (
          <p className="adm-empty">
            {orders.length ? 'No orders match this filter.' : status === 'loading' ? 'Loading orders…' : 'No orders yet.'}
          </p>
        ) : (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr><th>Order</th><th>Date</th><th>Customer</th><th>City</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id} className="adm-row" onClick={() => setOpenId(o.id)}>
                    <td><button type="button" className="adm-linkbtn" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>{o.id}</button></td>
                    <td>{fmtDate(o.createdAt)}</td>
                    <td>{customerName(o)}<small>{o.customer.phone}</small></td>
                    <td>{o.customer.city}</td>
                    <td>{itemCount(o)}</td>
                    <td>{o.payment.id === 'cod' ? 'COD' : 'Bank'}</td>
                    <td><strong>{formatPrice(o.total)}</strong></td>
                    <td><StatusSelect order={o} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open && <OrderPanel order={open} catalog={catalog} onClose={() => setOpenId(null)} />}
    </>
  );
}
