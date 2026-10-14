import Watch from './Watch.jsx';
import { WATCH_STYLES } from '../data/products.js';
import { useEffect, useState } from 'react';
import { pktTimeString } from '../lib/clock.js';
import './FeaturedCollection.css';

function LiveTime() {
  const [now, setNow] = useState(pktTimeString);
  useEffect(() => {
    const t = setInterval(() => setNow(pktTimeString()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="feature__live">
      <span className="feature__dot" aria-hidden="true" />
      <span>Live · Pakistan time</span>
      <time aria-live="off">{now}</time>
    </div>
  );
}

// A full-width band: a close-up of a watch showing live Pakistan time.
export default function FeaturedCollection() {
  return (
    <section className="feature" aria-label="Live Pakistan time">
      <div className="feature__media">
        <div className="feature__watch"><Watch style={WATCH_STYLES.verdant} /></div>
        <div className="feature__vignette" />
        <LiveTime />
      </div>
    </section>
  );
}
