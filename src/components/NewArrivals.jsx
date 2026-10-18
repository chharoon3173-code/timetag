import { ProductVisual } from './Watch.jsx';
import HeartButton from './HeartButton.jsx';
import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import Price from './Price.jsx';
import { href } from '../lib/router.js';
import './NewArrivals.css';

/** Row of four product cards. Used for "Just In" and "You may also like". */
export default function NewArrivals({
  wishlist,
  items,
  eyebrow = 'Just In',
  title = (<>New Watches. <em>New Stories.</em></>),
  linkLabel = 'Shop New Arrivals',
  tag = 'New',
}) {
  return (
    <section className="section section--ivory" aria-labelledby={`row-${eyebrow}`}>
      <div className="container">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={`row-${eyebrow}`} className="display">{title}</h2>
          </div>
          <a href="#edit" className="text-link">{linkLabel} <Arrow /></a>
        </Reveal>

        <div className="arrivals">
          {items.map((p, i) => (
            <Reveal as="article" key={p.id} delay={i * 90} className="arrival">
              <div className="arrival__visual">
                {p.stock <= 0 ? <span className="arrival__tag arrival__tag--muted">Sold out</span> : tag && <span className="arrival__tag">{tag}</span>}
                <HeartButton product={p} wishlist={wishlist} light size={16} />
                <a href={href(`/product/${p.id}`)} className="arrival__watch" aria-label={p.name}><ProductVisual product={p} hoverSwap /></a>
              </div>
              <div className="arrival__meta">
                <div>
                  <h3 className="arrival__name"><a href={href(`/product/${p.id}`)}>{p.name}</a></h3>
                  {p.collection && <p className="arrival__coll">{p.collection}</p>}
                </div>
                <span className="arrival__price"><Price product={p} /></span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
