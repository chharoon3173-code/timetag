import { useEffect, useMemo, useState } from 'react';
import { CheckoutShell, OrderSummary } from '../components/checkout/CheckoutShell.jsx';
import PaymentAccounts, { paymentWhatsAppLink } from '../components/checkout/PaymentAccounts.jsx';
import { PAYMENT_METHODS, SHIPPING_METHODS, placeOrder, useCart, useCatalogStatus } from '../lib/store.js';
import { href, navigate } from '../lib/router.js';
import { PAYMENT_WHATSAPP, formatPrice } from '../data/products.js';

const SAVED_KEY = 'timetag:checkout-info';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (v) => v.replace(/\D/g, '');
const isPhone = (v) => /^[+\d][\d\s-]*$/.test(v.trim()) && digits(v).length >= 10 && digits(v).length <= 13;

const EMPTY = {
  contact: '', country: 'Pakistan', firstName: '', lastName: '',
  address: '', apartment: '', city: '', postal: '', phone: '',
};

function loadSaved() {
  try {
    return { ...EMPTY, ...(JSON.parse(window.localStorage.getItem(SAVED_KEY)) || {}) };
  } catch {
    return EMPTY;
  }
}

function validate(f) {
  const e = {};
  if (!f.contact.trim()) e.contact = 'Enter an email or mobile phone number';
  else if (!EMAIL_RE.test(f.contact.trim()) && !isPhone(f.contact)) e.contact = 'Enter a valid email or mobile phone number';
  if (!f.firstName.trim()) e.firstName = 'Enter a first name';
  if (!f.lastName.trim()) e.lastName = 'Enter a last name';
  if (!f.address.trim()) e.address = 'Enter an address';
  if (!f.city.trim()) e.city = 'Enter a city';
  if (!f.phone.trim()) e.phone = 'Enter a phone number';
  else if (!isPhone(f.phone)) e.phone = 'Enter a valid phone number';
  return e;
}

function Field({ id, label, value, onChange, error, className = '', type = 'text', autoComplete, help }) {
  return (
    <div className={`co-field ${className}${error ? ' has-error' : ''}`}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder=" "
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(id, e.target.value)}
      />
      <label htmlFor={id}>{label}</label>
      {help && <span className="co-help" title={help} aria-label={help}>?</span>}
      {error && <p id={`${id}-err`} className="co-err">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();
  const catalogStatus = useCatalogStatus(); // the watches in the bag are looked up in the database
  const [form, setForm] = useState(loadSaved);
  const [newsletter, setNewsletter] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [shippingId, setShippingId] = useState(SHIPPING_METHODS[0].id);
  const [paymentId, setPaymentId] = useState(PAYMENT_METHODS[0].id);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Checkout — TimeTag';
  }, []);

  const shipping = SHIPPING_METHODS.find((m) => m.id === shippingId);
  const total = subtotal + shipping.price;

  const summaryLines = useMemo(
    () => lines.map((l) => ({ id: l.id, name: l.product.name, collection: l.product.collection, price: l.product.price, qty: l.qty, product: l.product })),
    [lines]
  );

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setSubmitting(true);
    const customer = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    const result = await placeOrder({ customer, shippingId, paymentId, newsletter }); // the database checks stock and prices
    if (!result.ok) {
      setSubmitting(false);
      setSubmitError(result.error);
      return;
    }
    try {
      if (saveInfo) window.localStorage.setItem(SAVED_KEY, JSON.stringify(customer));
      else window.localStorage.removeItem(SAVED_KEY);
    } catch {
      /* ignore */
    }
    navigate(`/thank-you/${result.order.id}`);
  };

  if (!lines.length && catalogStatus === 'loading') {
    return (
      <CheckoutShell
        summaryTotal="…"
        main={<div className="co-empty"><p>Loading your bag…</p></div>}
        summary={<OrderSummary lines={[]} subtotal={0} shipping={null} total={0} />}
      />
    );
  }

  if (!lines.length) {
    return (
      <CheckoutShell
        summaryTotal={formatPrice(0)}
        main={
          <div className="co-empty">
            <h1>Your bag is empty</h1>
            <p>Add a watch to your bag to check out.</p>
            <a href="#edit" className="co-btn">Continue shopping</a>
          </div>
        }
        summary={<OrderSummary lines={[]} subtotal={0} shipping={null} total={0} />}
      />
    );
  }

  return (
    <CheckoutShell
      summaryTotal={formatPrice(total)}
      summary={<OrderSummary lines={summaryLines} subtotal={subtotal} shipping={shipping.price} total={total} />}
      main={
        <form className="co-form" onSubmit={onSubmit} noValidate>
          <h1 className="sr-only">Checkout</h1>

          <section className="co-section" aria-labelledby="co-contact">
            <div className="co-section__head">
              <h2 id="co-contact">Contact</h2>
              <a href={href('/')} className="co-link">Continue shopping</a>
            </div>
            <Field id="contact" label="Email or mobile phone number" value={form.contact} onChange={update} error={errors.contact} autoComplete="email" help="We’ll use this to send order updates" />
            <label className="co-check">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              <span>Email me with news and offers</span>
            </label>
          </section>

          <section className="co-section" aria-labelledby="co-delivery">
            <h2 id="co-delivery">Delivery</h2>
            <div className="co-grid">
              <div className="co-field co-field--select co-span">
                <select id="country" value={form.country} onChange={(e) => update('country', e.target.value)} autoComplete="country-name">
                  <option>Pakistan</option>
                </select>
                <label htmlFor="country">Country/Region</label>
              </div>
              <Field id="firstName" label="First name" value={form.firstName} onChange={update} error={errors.firstName} autoComplete="given-name" />
              <Field id="lastName" label="Last name" value={form.lastName} onChange={update} error={errors.lastName} autoComplete="family-name" />
              <Field id="address" label="Address" value={form.address} onChange={update} error={errors.address} autoComplete="address-line1" className="co-span" />
              <Field id="apartment" label="Apartment, suite, etc. (optional)" value={form.apartment} onChange={update} autoComplete="address-line2" className="co-span" />
              <Field id="city" label="City" value={form.city} onChange={update} error={errors.city} autoComplete="address-level2" />
              <Field id="postal" label="Postal code (optional)" value={form.postal} onChange={update} autoComplete="postal-code" />
              <Field id="phone" label="Phone" type="tel" value={form.phone} onChange={update} error={errors.phone} autoComplete="tel" className="co-span" help="In case we need to contact you about your order" />
            </div>
            <label className="co-check">
              <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} />
              <span>Save this information for next time</span>
            </label>
          </section>

          <section className="co-section" aria-labelledby="co-ship">
            <h2 id="co-ship">Shipping method</h2>
            <div className="co-options" role="radiogroup" aria-labelledby="co-ship">
              {SHIPPING_METHODS.map((m) => (
                <label key={m.id} className={`co-option${shippingId === m.id ? ' is-selected' : ''}`}>
                  <input type="radio" name="shipping" value={m.id} checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
                  <span className="co-option__text">{m.label}<small>{m.detail}</small></span>
                  <strong>{m.price === 0 ? 'Free' : formatPrice(m.price)}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="co-section" aria-labelledby="co-pay">
            <h2 id="co-pay">Payment</h2>
            <p className="co-sub">All transactions are secure.</p>
            <div className="co-options" role="radiogroup" aria-labelledby="co-pay">
              {PAYMENT_METHODS.map((m) => (
                <div key={m.id} className={`co-option-wrap${paymentId === m.id ? ' is-selected' : ''}`}>
                  <label className="co-option">
                    <input type="radio" name="payment" value={m.id} checked={paymentId === m.id} onChange={() => setPaymentId(m.id)} />
                    <span className="co-option__text">{m.label}</span>
                  </label>
                  {paymentId === m.id && m.id !== 'bank' && <p className="co-option__detail">{m.detail}</p>}
                  {paymentId === m.id && m.id === 'bank' && (
                    <div className="co-option__detail">
                      <p>Send <strong>{formatPrice(total)}</strong> to one of these accounts:</p>
                      <PaymentAccounts />
                      <p>
                        <strong>Important:</strong> after paying, send a screenshot of the payment on WhatsApp to{' '}
                        <a href={paymentWhatsAppLink()} target="_blank" rel="noreferrer">{PAYMENT_WHATSAPP}</a>.
                        Your order will be confirmed once we’ve verified your payment.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {submitError && <p className="co-submit-err" role="alert">{submitError}</p>}

          <button type="submit" className="co-btn co-btn--full" disabled={submitting}>
            {submitting ? 'Placing order…' : paymentId === 'cod' ? `Complete order · ${formatPrice(total)}` : `Place order · ${formatPrice(total)}`}
          </button>

          <p className="co-legal">
            By placing your order you agree to our <a href="#contact">Terms</a> and <a href="#contact">Privacy Policy</a>.
          </p>
        </form>
      }
    />
  );
}
