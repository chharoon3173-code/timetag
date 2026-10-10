import { useEffect, useRef } from 'react';
import { ProductVisual } from './Watch.jsx';
import QtyStepper from './QtyStepper.jsx';
import { CloseIcon, Arrow } from './Icons.jsx';
import { closeCart, removeFromCart, setCartQty, useCart, useCartOpen, MAX_PER_ITEM } from '../lib/store.js';
import { href } from '../lib/router.js';
import { formatPrice } from '../data/products.js';
import './CartDrawer.css';

export default function CartDrawer() {
  const open = useCartOpen();
  const { lines, count, subtotal } = useCart();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`cart${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="cart__overlay" onClick={closeCart} />
      <aside className="cart__panel" role="dialog" aria-modal="true" aria-label="Shopping bag" tabIndex={-1} ref={panelRef}>
        <header className="cart__head">
          <h2>Your Bag <span>({count})</span></h2>
          <button type="button" className="icon-btn" aria-label="Close bag" onClick={closeCart}><CloseIcon /></button>
        </header>

        {lines.length === 0 ? (
          <div className="cart__empty">
            <p>Your bag is empty.</p>
            <a href="#edit" className="btn btn--gold" onClick={closeCart}>Shop Watches <Arrow /></a>
          </div>
        ) : (
          <>
            <ul className="cart__lines">
              {lines.map(({ id, qty, product, lineTotal }) => (
                <li key={id} className="cart__line">
                  <a href={href(`/product/${id}`)} className="cart__thumb" onClick={closeCart} aria-label={product.name}>
                    <ProductVisual product={product} />
                  </a>
                  <div className="cart__info">
                    <a href={href(`/product/${id}`)} className="cart__name" onClick={closeCart}>{product.name}</a>
                    <span className="cart__coll">{product.collection}</span>
                    <div className="cart__row">
                      <QtyStepper size="sm" value={qty} max={Math.min(MAX_PER_ITEM, product.stock)} onChange={(q) => setCartQty(id, q)} />
                      <button type="button" className="cart__remove" onClick={() => removeFromCart(id)}>Remove</button>
                    </div>
                  </div>
                  <span className="cart__price">{formatPrice(lineTotal)}</span>
                </li>
              ))}
            </ul>
            <footer className="cart__foot">
              <div className="cart__sub"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="cart__note">Free standard shipping. Cash on Delivery available.</p>
              <a href={href('/checkout')} className="btn btn--gold cart__checkout" onClick={closeCart}>Checkout <Arrow /></a>
              <button type="button" className="cart__continue" onClick={closeCart}>Continue shopping</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
