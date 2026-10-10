import { useState } from 'react';
import { ProductVisual } from '../Watch.jsx';
import { LockIcon } from '../Icons.jsx';
import { href } from '../../lib/router.js';
import { formatPrice } from '../../data/products.js';
import './Checkout.css';

export function CheckoutLogo() {
  return (
    <a href={href('/')} className="co-logo" aria-label="TimeTag — back to store">
      <svg width="44" height="44" viewBox="0 0 46 46" aria-hidden="true">
        <circle cx="23" cy="23" r="22" fill="#141210" />
        <circle cx="23" cy="23" r="18.5" fill="none" stroke="#C9A96E" strokeWidth="0.6" />
        <text x="18.5" y="28.6" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="16" fill="#F4EFE6" fontWeight="500">T</text>
        <text x="27" y="28.6" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="16" fill="#C9A96E" fontStyle="italic">T</text>
      </svg>
      <span>TIMETAG</span>
    </a>
  );
}

/** White Shopify-style page with centred logo, form column and grey summary column. */
export function CheckoutShell({ main, summary, summaryTotal }) {
  const [showSummary, setShowSummary] = useState(false);
  return (
    <div className="co">
      <header className="co-header">
        <div className="co-header__in">
          <CheckoutLogo />
          <span className="co-secure"><LockIcon size={16} sw={1.4} /> Secure checkout</span>
        </div>
      </header>

      <button
        type="button"
        className="co-summary-toggle"
        aria-expanded={showSummary}
        aria-controls="co-summary"
        onClick={() => setShowSummary((s) => !s)}
      >
        <span>{showSummary ? 'Hide' : 'Show'} order summary <i aria-hidden="true">{showSummary ? '▴' : '▾'}</i></span>
        <strong>{summaryTotal}</strong>
      </button>

      <div className="co-body">
        <main className="co-main" id="main">{main}</main>
        <aside id="co-summary" className={`co-side${showSummary ? ' is-open' : ''}`} aria-label="Order summary">
          <div className="co-side__in">{summary}</div>
        </aside>
      </div>
    </div>
  );
}

/** Line items + totals. `lines`: [{ id, name, collection, price, qty, product }] */
export function OrderSummary({ lines, subtotal, shipping, total }) {
  return (
    <>
      <ul className="co-lines">
        {lines.map((l) => (
          <li key={l.id} className="co-line">
            <span className="co-thumb">
              {l.product ? <ProductVisual product={l.product} /> : null}
              <b aria-label={`Quantity ${l.qty}`}>{l.qty}</b>
            </span>
            <span className="co-line__name">
              {l.name}
              <small>{l.collection}</small>
            </span>
            <span className="co-line__price">{formatPrice(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="co-totals">
        <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        <div>
          <dt>Shipping</dt>
          <dd>{shipping == null ? <span className="co-muted">Enter shipping address</span> : shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        <div className="co-totals__grand">
          <dt>Total</dt>
          <dd><small>PKR</small> {formatPrice(total)}</dd>
        </div>
      </dl>
    </>
  );
}
