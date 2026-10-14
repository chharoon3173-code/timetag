import Watch from './Watch.jsx';
import { WATCH_STYLES } from '../data/products.js';
import './FeaturedCollection.css';

// A full-width decorative band: a close-up of a TimeTag watch (its hands show Pakistan time).
export default function FeaturedCollection() {
  return (
    <section className="feature" aria-hidden="true">
      <div className="feature__media">
        <div className="feature__watch"><Watch style={WATCH_STYLES.verdant} /></div>
        <div className="feature__vignette" />
      </div>
    </section>
  );
}
