import { ProductVisual } from './Watch.jsx';
import HeartButton from './HeartButton.jsx';
import Reveal from './Reveal.jsx';
import { formatPrice } from '../data/products.js';
import { href } from '../lib/router.js';
import './TimeTagEdit.css';

/** All watches in the shop as a clean grid — 2 per row on phones, 3 on tablets, 4 on desktop. */
export default function TimeTagEdit({ wishlist, products }) {
  return (
    <section className="section section--ivory shop" id="edit" aria-labelledby="shop-title">
      <div className="container">
        <div className="shop__head">
          <h2 id="shop-title" className="shop__title">All Watches</h2>
          <span className="shop__count">
            {products.length} {products.length === 1 ? 'watch' : 'watches'}
          </span>
        </div>

        {products.length === 0 ? (
          <p className="shop__empty">New watches are on their way. Check back soon.</p>
        ) : (
          <div className="shop__grid">
            {products.map((p, i) => {
              const link = href(`/product/${p.id}`);
              const soldOut = p.stock <= 0;
              return (
                <Reveal as="article" key={p.id} delay={(i % 4) * 80} className="shop-card">
                  <div className="shop-card__media">
                    {/* the photo is a second link to the same page, so it's hidden from screen readers */}
                    <a href={link} className="shop-card__visual" tabIndex={-1} aria-hidden="true">
                      <ProductVisual product={p} />
                    </a>
                    {soldOut ? (
                      <span className="shop-card__tag shop-card__tag--muted">Sold out</span>
                    ) : (
                      p.badge && <span className="shop-card__tag">{p.badge}</span>
                    )}
                    <HeartButton product={p} wishlist={wishlist} light size={16} />
                  </div>
                  <div className="shop-card__info">
                    {p.collection && <p className="shop-card__coll">{p.collection}</p>}
                    <h3 className="shop-card__name"><a href={link}>{p.name}</a></h3>
                    <p className="shop-card__price">{formatPrice(p.price)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
