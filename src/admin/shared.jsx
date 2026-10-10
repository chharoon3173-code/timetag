import { formatPrice } from '../data/products.js';

export const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function StatusPill({ status }) {
  return <span className={`adm-pill adm-pill--${status}`}>{STATUS_LABEL[status] || status}</span>;
}

export const fmtDate = (iso) =>
  new Date(iso).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const customerName = (o) => `${o.customer.firstName} ${o.customer.lastName}`.trim();
export const itemCount = (o) => o.items.reduce((n, i) => n + i.qty, 0);
export { formatPrice };
