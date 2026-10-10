import { ProductVisual } from './Watch.jsx';
import HeartButton from './HeartButton.jsx';
import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { NEW_ARRIVAL_IDS, PRODUCTS, formatPrice } from '../data/products.js';
import './NewArrivals.css';

export default function NewArrivals({ wishlist }) {
  const items = NEW_ARRIVAL_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);

  return (
    <section className="section section--ivory" aria-labelledby="new-title">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">Just In</p>
            <h2 id="new-title" className="display">New Watches. <em>New Stories.</em></h2>
          </div>
          <a href="#edit" className="text-link">Shop New Arrivals <Arrow /></a>
        </Reveal>

        <div className="arrivals">
          {items.map((p, i) => (
            <Reveal as="article" key={p.id} delay={i * 90} className="arrival">
              <div className="arrival__visual">
                <span className="arrival__tag">New</span>
                <HeartButton product={p} wishlist={wishlist} light size={16} />
                <div className="arrival__watch"><ProductVisual product={p} /></div>
              </div>
              <div className="arrival__meta">
                <div>
                  <h3 className="arrival__name"><a href="#edit">{p.name}</a></h3>
                  <p className="arrival__coll">{p.collection}</p>
                </div>
                <span className="arrival__price">{formatPrice(p.price)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
