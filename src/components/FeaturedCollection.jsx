import Watch from './Watch.jsx';
import Reveal from './Reveal.jsx';
import { Arrow } from './Icons.jsx';
import { WATCH_STYLES } from '../data/products.js';
import './FeaturedCollection.css';

export default function FeaturedCollection() {
  return (
    <section className="feature" aria-labelledby="feature-title">
      <div className="feature__media">
        <div className="feature__watch"><Watch style={WATCH_STYLES.verdant} /></div>
        <div className="feature__vignette" />
      </div>
      <div className="feature__copy section--ivory">
        <Reveal>
          <p className="eyebrow">Featured Collection</p>
          <h2 id="feature-title" className="display feature__title">Timeless<br /><em>by Design</em></h2>
          <p className="feature__quote">“Crafted for moments that deserve to be remembered.”</p>
          <a href="#collections" className="btn btn--dark">Discover the Collection <Arrow /></a>
        </Reveal>
      </div>
    </section>
  );
}
