import Grain from './Grain.jsx';
import { Arrow } from './Icons.jsx';
import './Hero.css';

// To change the hero photo, replace public/brand/hero.jpg (a dark photo works best behind the text).
export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__photo">
        <img
          src="brand/hero.jpg"
          alt="A selection of TimeTag watches laid out on a black background"
          width="1200"
          height="1511"
          fetchPriority="high"
          decoding="async"
        />
      </div>
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
      </div>
      <div className="hero__scroll" aria-hidden="true">Scroll<i /></div>
    </section>
  );
}
