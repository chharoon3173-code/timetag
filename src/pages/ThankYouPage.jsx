import { useEffect } from 'react';
import { CheckoutShell, OrderSummary } from '../components/checkout/CheckoutShell.jsx';
import { useCatalog, useOrder } from '../lib/store.js';
import { href } from '../lib/router.js';
import { formatPrice } from '../data/products.js';

// Shown to customers who choose "Bank transfer". Replace with your real account details.
const BANK_DETAILS = [
  ['Bank', '[Your bank name]'],
  ['Account title', '[Account title]'],
  ['Account no. / IBAN', '[Your IBAN]'],
];

export default function ThankYouPage({ id }) {
  const order = useOrder(id);
  const catalog = useCatalog();

  useEffect(() => {
    document.title = order ? `Thank you — Order ${order.id}` : 'Order not found — TimeTag';
  }, [order]);

  if (!order) {
    return (
      <CheckoutShell
        summaryTotal={formatPrice(0)}
        summary={<OrderSummary lines={[]} subtotal={0} shipping={null} total={0} />}
        main={
          <div className="co-empty">
            <h1>Order not found</h1>
            <p>We couldn’t find order {id} on this device.</p>
            <a href={href('/')} className="co-btn">Back to the store</a>
          </div>
        }
      />
    );
  }

  const c = order.customer;
  const lines = order.items.map((i) => ({ ...i, product: catalog.find((p) => p.id === i.id) }));
  const placed = new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <CheckoutShell
      summaryTotal={formatPrice(order.total)}
      summary={<OrderSummary lines={lines} subtotal={order.subtotal} shipping={order.shipping.price} total={order.total} />}
      main={
        <div className="ty">
          <div className="ty-head">
            <span className="ty-check" aria-hidden="true">
              <svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div>
              <p className="ty-num">Order {order.id}</p>
              <h1>Thank you, {c.firstName}!</h1>
            </div>
          </div>

          <div className="ty-card">
            <h2>Your order is confirmed</h2>
            <p>
              We’ve received your order and will contact you on <strong>{c.phone}</strong> to confirm delivery.
              {order.payment.id === 'cod' && <> Please keep <strong>{formatPrice(order.total)}</strong> ready in cash when it arrives.</>}
            </p>
          </div>

          {order.payment.id === 'bank' && (
            <div className="ty-card ty-card--accent">
              <h2>Complete your payment</h2>
              <p>Transfer <strong>{formatPrice(order.total)}</strong> to the account below and use <strong>{order.id}</strong> as the reference. We’ll dispatch your watch once payment is received.</p>
              <dl className="ty-bank">
                {BANK_DETAILS.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
                <div><dt>Reference</dt><dd>{order.id}</dd></div>
              </dl>
            </div>
          )}

          <div className="ty-card">
            <h2>Order details</h2>
            <div className="ty-details">
              <div>
                <h3>Contact information</h3>
                <p>{c.contact}</p>
              </div>
              <div>
                <h3>Payment method</h3>
                <p>{order.payment.label}<br /><span className="co-muted">{formatPrice(order.total)}</span></p>
              </div>
              <div>
                <h3>Shipping address</h3>
                <p>
                  {c.firstName} {c.lastName}<br />
                  {c.address}{c.apartment && <>, {c.apartment}</>}<br />
                  {c.city}{c.postal && <> {c.postal}</>}<br />
                  {c.country}<br />
                  {c.phone}
                </p>
              </div>
              <div>
                <h3>Shipping method</h3>
                <p>{order.shipping.label}<br /><span className="co-muted">{order.shipping.detail}</span></p>
                <h3 className="ty-mt">Order placed</h3>
                <p>{placed}</p>
              </div>
            </div>
          </div>

          <div className="ty-foot">
            <p>Need help? <a href="#contact" className="co-link">Contact us</a></p>
            <a href={href('/')} className="co-btn">Continue shopping</a>
          </div>
        </div>
      }
    />
  );
}
