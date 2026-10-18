import { useMemo, useState } from 'react';
import { ProductVisual } from './Watch.jsx';
import HeartButton from './HeartButton.jsx';
import Reveal from './Reveal.jsx';
import LoadingState from './LoadingState.jsx';
import Price from './Price.jsx';
import { href } from '../lib/router.js';
import { useCatalogError, useCatalogStatus } from '../lib/store.js';
import './TimeTagEdit.css';

// The dropdown above the grid: show everything, only some watches, or sort by price.
const VIEWS = [
  { key: 'all', label: 'All watches', pick: (list) => list }, // newest first
  { key: 'best', label: 'Best sellers', pick: (list) => list.filter((p) => p.tags.includes('best')) },
  { key: 'new', label: 'New arrivals', pick: (list) => list.filter((p) => p.tags.includes('new')) },
  { key: 'low', label: 'Price: low to high', pick: (list) => [...list].sort((a, b) => a.price - b.price) },
  { key: 'high', label: 'Price: high to low', pick: (list) => [...list].sort((a, b) => b.price - a.price) },
];

/**
 * Watches as a clean grid — 2 per row on phones, 3 on tablets, 4 on desktop.
 * On the home page it's "All Watches" (#edit). Collection pages reuse it with their own
 * `title` (and `titleAs="h1"`), hide the collection name on each card, and pass an `empty` message.
 */
export default function TimeTagEdit({
  wishlist,
  products,
  id = 'edit',
  title = 'All Watches',
  titleAs: Title = 'h2',
  className = '',
  showCollection = true,
  empty = <p className="shop__empty">New watches are on their way. Check back soon.</p>,
}) {
  const status = useCatalogStatus();
  const error = useCatalogError();
  const [view, setView] = useState('all');
  const shown = useMemo(() => VIEWS.find((v) => v.key === view).pick(products), [view, products]);
  return (
    <section className={`section section--ivory shop ${className}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className="shop__head">
          <Title id={`${id}-title`} className="shop__title">{title}</Title>
          <div className="shop__tools">
            {(products.length > 0 || status === 'ready') && (
              <span className="shop__count" aria-live="polite">
                {shown.length} {shown.length === 1 ? 'watch' : 'watches'}
              </span>
            )}
            {products.length > 0 && (
              <label className="shop__sort">
                <span className="sr-only">Show</span>
                <select value={view} onChange={(e) => setView(e.target.value)}>
                  {VIEWS.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          status === 'loading' ? <LoadingState inline text="Loading watches…" />
          : status === 'error' ? <LoadingState inline error={`We couldn’t load the watches. ${error}`} />
          : empty
        ) : shown.length === 0 ? (
          <p className="shop__empty">
            No {view === 'best' ? 'best sellers' : 'new arrivals'} here yet.{' '}
            <button type="button" className="shop__reset" onClick={() => setView('all')}>Show all watches</button>
          </p>
        ) : (
          <div className="shop__grid">
            {shown.map((p, i) => {
              const link = href(`/product/${p.id}`);
              const soldOut = p.stock <= 0;
              return (
                <Reveal as="article" key={p.id} delay={(i % 4) * 80} className="shop-card">
                  <div className="shop-card__media">
                    {/* the photo is a second link to the same page, so it's hidden from screen readers */}
                    <a href={link} className="shop-card__visual" tabIndex={-1} aria-hidden="true">
                      <ProductVisual product={p} hoverSwap />
                    </a>
                    {soldOut ? (
                      <span className="shop-card__tag shop-card__tag--muted">Sold out</span>
                    ) : (
                      p.badge && <span className="shop-card__tag">{p.badge}</span>
                    )}
                    <HeartButton product={p} wishlist={wishlist} light size={16} />
                  </div>
                  <div className="shop-card__info">
                    {showCollection && p.collection && <p className="shop-card__coll">{p.collection}</p>}
                    <h3 className="shop-card__name"><a href={link}>{p.name}</a></h3>
                    <p className="shop-card__price"><Price product={p} /></p>
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
