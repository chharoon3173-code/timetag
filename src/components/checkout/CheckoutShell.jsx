import { useState } from 'react';
import { ProductVisual } from '../Watch.jsx';
import { LockIcon } from '../Icons.jsx';
import { href } from '../../lib/router.js';
import { formatPrice } from '../../data/products.js';
import './Checkout.css';

export function CheckoutLogo() {
  return (
    <a href={href('/')} className="co-logo" aria-label="TimeTag — back to store">
      <span className="co-logo__badge"><img src="brand/lion.png" alt="" height="48" width="33" /></span>
      <img src="brand/wordmark.png" alt="TimeTag" className="co-logo__word" width="110" height="20" />
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
