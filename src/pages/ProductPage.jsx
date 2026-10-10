import { useEffect, useMemo, useState } from 'react';
import Watch from '../components/Watch.jsx';
import HeartButton from '../components/HeartButton.jsx';
import QtyStepper from '../components/QtyStepper.jsx';
import NewArrivals from '../components/NewArrivals.jsx';
import NotFound from './NotFound.jsx';
import { Arrow, Stars, TruckIcon, ShieldIcon, ReturnIcon } from '../components/Icons.jsx';
import { addToCart, openCart, useCart, useShopProducts, LOW_STOCK, MAX_PER_ITEM } from '../lib/store.js';
import { href, navigate } from '../lib/router.js';
import { formatPrice } from '../data/products.js';
import './ProductPage.css';

const VIEWS = [
  { id: 'front', label: 'Front view' },
  { id: 'angle', label: 'Angled view' },
  { id: 'detail', label: 'Dial detail' },
];

/** One gallery slide: an uploaded photo, or one of three angles of the drawn watch. */
function GalleryImage({ product, slide }) {
  if (slide.photo) return <img src={slide.photo} alt={`${product.name} — ${slide.label}`} className="pp-photo" />;
  return (
    <div className={`pp-draw pp-draw--${slide.id}`}>
      <Watch style={product.watch} />
    </div>
  );
}

export default function ProductPage({ id, wishlist }) {
  const products = useShopProducts();
  const product = products.find((p) => p.id === id);
  const { lines } = useCart();
  const [view, setView] = useState(0);
  const slides = useMemo(() => {
    const photos = product?.images || [];
    return photos.length
      ? photos.map((photo, i) => ({ id: `photo-${i}`, label: `Photo ${i + 1}`, photo }))
      : VIEWS;
  }, [product]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) document.title = `${product.name} — TimeTag`;
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    const others = products.filter((p) => p.id !== product.id);
    return [...others.filter((p) => p.collection === product.collection), ...others.filter((p) => p.collection !== product.collection)].slice(0, 4);
  }, [products, product]);

  if (!product) return <NotFound title="Watch not found" text="This watch isn’t available right now." />;

  const inBag = lines.find((l) => l.id === product.id)?.qty || 0;
  const maxAddable = Math.max(0, Math.min(MAX_PER_ITEM, product.stock) - inBag);
  const soldOut = product.stock <= 0;
  const q = Math.min(qty, Math.max(1, maxAddable));

  const stockLine = soldOut
    ? { cls: 'out', text: 'Sold out' }
    : product.stock <= LOW_STOCK
    ? { cls: 'low', text: `Only ${product.stock} left — order soon` }
    : { cls: 'in', text: 'In stock — ready to ship' };

  const handleAdd = () => {
    if (addToCart(product.id, q)) {
      setAdded(true);
      setQty(1);
      openCart();
      setTimeout(() => setAdded(false), 2000);
    }
  };
  const handleBuyNow = () => {
    if (maxAddable > 0) addToCart(product.id, q);
    navigate('/checkout');
  };

  return (
    <>
      <section className="pp">
        <div className="container">
          <nav className="pp-crumbs" aria-label="Breadcrumb">
            <a href="#top">Home</a><span aria-hidden="true">/</span>
            <a href="#collections">{product.collection}</a><span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pp-grid">
            <div className="pp-gallery">
              <div className="pp-stage">
                {product.badge && <span className="pp-badge">{product.badge}</span>}
                <GalleryImage product={product} slide={slides[Math.min(view, slides.length - 1)]} />
              </div>
              {slides.length > 1 && (
              <div className={`pp-thumbs${slides.length > 3 ? ' pp-thumbs--many' : ''}`} role="tablist" aria-label="Product images">
                {slides.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={view === i}
                    aria-label={v.label}
                    className={`pp-thumb${view === i ? ' is-active' : ''}`}
                    onClick={() => setView(i)}
                  >
                    <GalleryImage product={product} slide={v} />
                  </button>
                ))}
              </div>
              )}
            </div>

            <div className="pp-info">
              <p className="eyebrow">{product.collection}</p>
              <h1 className="pp-title">{product.name}</h1>
              <div className="pp-rating"><Stars rating={product.rating} /></div>
              <p className="pp-price">{formatPrice(product.price)}</p>
              <p className="pp-desc">{product.description}</p>

              <p className={`pp-stock pp-stock--${stockLine.cls}`}><i aria-hidden="true" />{stockLine.text}</p>

              <div className="pp-buy">
                {!soldOut && (
                  <QtyStepper value={q} max={Math.max(1, maxAddable)} onChange={(n) => setQty(Math.max(1, Math.min(n, maxAddable)))} />
                )}
                <button type="button" className="btn btn--gold pp-add" onClick={handleAdd} disabled={soldOut || maxAddable === 0}>
                  {soldOut ? 'Sold out' : maxAddable === 0 ? 'Max in bag' : added ? 'Added ✓' : 'Add to Bag'}
                </button>
                <div className="pp-heart"><HeartButton product={product} wishlist={wishlist} /></div>
              </div>
              {!soldOut && (
                <button type="button" className="btn btn--outline pp-now" onClick={handleBuyNow}>
                  Buy it now <Arrow />
                </button>
              )}
              {inBag > 0 && <p className="pp-inbag">{inBag} in your bag · <a href={href('/checkout')}>Go to checkout</a></p>}

              <ul className="pp-perks">
                <li><TruckIcon size={24} /> Free standard delivery</li>
                <li><ShieldIcon size={24} /> 100% authentic</li>
                <li><ReturnIcon size={24} /> Easy returns</li>
              </ul>

              <div className="pp-acc">
                <details open>
                  <summary>Details</summary>
                  <dl className="pp-specs">
                    <div><dt>Collection</dt><dd>{product.collection}</dd></div>
                    <div><dt>Strap</dt><dd>{product.strap || (product.watch.bracelet ? 'Steel bracelet' : 'Leather strap')}</dd></div>
                    {(product.specs || []).map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                </details>
                <details>
                  <summary>Shipping &amp; Returns</summary>
                  <p>Free standard delivery (3–5 business days) or express delivery (1–2 business days) for Rs. 500. Cash on Delivery is available nationwide.</p>
                  <p>Not quite right? Contact us and we’ll arrange an easy return.</p>
                </details>
                <details>
                  <summary>Watch Care</summary>
                  <p>Wipe with a soft dry cloth after wear. Keep away from strong magnets and extreme temperatures, and store in its TimeTag box when not in use.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <NewArrivals
          wishlist={wishlist}
          items={related}
          eyebrow="You may also like"
          title={<>Complete the <em>Collection</em></>}
          linkLabel="View all watches"
          tag={null}
        />
      )}
    </>
  );
}
