import { useMemo, useState } from 'react';
import { ProductVisual } from './Watch.jsx';
import HeartButton from './HeartButton.jsx';
import Reveal from './Reveal.jsx';
import { Arrow, Stars } from './Icons.jsx';
import { FILTERS, PRODUCTS, formatPrice } from '../data/products.js';
import './TimeTagEdit.css';

export default function TimeTagEdit({ wishlist }) {
  const [filter, setFilter] = useState('all');

  const items = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
    return PRODUCTS.filter(f.test).slice(0, 4);
  }, [filter]);

  const [featured, ...rest] = items;

  return (
    <section className="section edit" id="edit" aria-labelledby="edit-title">
      <div className="container">
        <Reveal className="section-head edit__head">
          <div>
            <p className="eyebrow">Curated for You</p>
            <p className="edit__kicker">The TimeTag Edit</p>
            <h2 id="edit-title" className="display">Watches Worth <em>Wearing</em></h2>
          </div>
          <a href="#edit" className="text-link">View All Watches <Arrow /></a>
        </Reveal>

        <div className="chips" role="group" aria-label="Filter watches">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`chip${filter === f.key ? ' is-active' : ''}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* key={filter} replays the entrance animation when the filter changes */}
        <div className="edit__grid" key={filter}>
          {featured && (
            <article className="pcard pcard--featured">
              <HeartButton product={featured} wishlist={wishlist} />
              <span className="pcard__badge">{featured.badge}</span>
              <div className="pcard__visual pcard__visual--featured">
                <ProductVisual product={featured} />
              </div>
              <div className="pcard__info">
                <h3 className="pcard__name pcard__name--lg">{featured.name}</h3>
                <p className="pcard__desc">“{featured.description}”</p>
                <Stars rating={featured.rating} />
                <div className="pcard__row">
                  <span className="pcard__price pcard__price--lg">{formatPrice(featured.price)}</span>
                  <a href="#edit" className="btn pcard__btn">View Details <Arrow /></a>
                </div>
              </div>
            </article>
          )}

          <div className="edit__stack">
            {rest.map((p, i) => (
              <article key={p.id} className="pcard pcard--compact" style={{ animationDelay: `${(i + 1) * 90}ms` }}>
                <HeartButton product={p} wishlist={wishlist} size={16} />
                <div className="pcard__visual pcard__visual--compact">
                  <ProductVisual product={p} />
                </div>
                <div className="pcard__info pcard__info--compact">
                  <span className="pcard__badge pcard__badge--inline">{p.collection}</span>
                  <h3 className="pcard__name">{p.name}</h3>
                  <span className="pcard__price">{formatPrice(p.price)}</span>
                  <a href="#edit" className="btn btn--small pcard__btn">View</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
