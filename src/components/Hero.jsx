import Watch from './Watch.jsx';
import Grain from './Grain.jsx';
import { Arrow } from './Icons.jsx';
import { WATCH_STYLES } from '../data/products.js';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <Grain />
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__in" style={{ animationDelay: '0.1s' }}>More Than Just Time</p>
          <h1 id="hero-title" className="hero__title hero__in" style={{ animationDelay: '0.25s' }}>
            Time<em>Tag</em>
          </h1>
          <p className="hero__sub hero__in" style={{ animationDelay: '0.4s' }}>
            Precision. Character. Timeless Style.
          </p>
          <div className="hero__ctas hero__in" style={{ animationDelay: '0.55s' }}>
            <a href="#edit" className="btn btn--gold">Shop Watches <Arrow /></a>
            <a href="#collections" className="btn btn--outline">Explore Collection</a>
          </div>
        </div>

        <div className="hero__visual">
          <span className="hero__ring hero__ring--outer" />
          <span className="hero__ring hero__ring--inner" />
          <div className="hero__watch">
            <Watch style={WATCH_STYLES.steelChrono} />
          </div>
          <div className="hero__spec">
            <span>Featured</span>
            <strong>Chronograph X1</strong>
          </div>
        </div>
      </div>
      <div className="hero__scroll" aria-hidden="true">Scroll<i /></div>
    </section>
  );
}
