import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { BRAND_COLLECTIONS } from '../data/products.js';
import './Collections.css';

export default function Collections() {
  return (
    <section className="section section--ivory" id="collections" aria-labelledby="collections-title">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">Shop by Collection</p>
            <h2 id="collections-title" className="display">Find Your <em>Signature</em> Timepiece</h2>
          </div>
          <a href="#edit" className="text-link">All Collections <Arrow /></a>
        </Reveal>

        {/* Swipeable row of brand tiles */}
        <Reveal>
          <div className="collections">
            {BRAND_COLLECTIONS.map((c) => (
              <a key={c.id} href="#edit" className="collection">
                <span className="collection__mark" aria-hidden="true">
                  {c.image ? <img src={c.image} alt="" loading="lazy" /> : c.mark}
                </span>
                <h3>{c.title}</h3>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
