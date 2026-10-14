import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { useCollections } from '../lib/store.js';
import { href } from '../lib/router.js';
import './Collections.css';

export default function Collections() {
  const collections = useCollections(); // managed in Admin → Collections
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

        {/* Swipeable row of brand tiles; each opens that collection's page */}
        <Reveal>
          <div className="collections">
            {collections.map((c) => (
              <a key={c.id} href={href(`/collection/${c.id}`)} className="collection">
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
