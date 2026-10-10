import Watch from './Watch.jsx';
import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { COLLECTIONS } from '../data/products.js';
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

        <div className="collections">
          {COLLECTIONS.map((c, i) => (
            <Reveal
              as="a"
              key={c.id}
              href="#edit"
              delay={i * 90}
              className={`collection collection--${c.size} collection--${c.tone}`}
            >
              <div className="collection__watch"><Watch style={c.watch} /></div>
              <div className="collection__shade" />
              <div className="collection__text">
                <span className="collection__no">{c.number}</span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <span className="collection__go">Explore <Arrow /></span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
