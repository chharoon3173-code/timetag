import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { CloseIcon } from './Icons.jsx';
import { CUSTOMER_REVIEWS } from '../data/products.js';
import './CustomerReviews.css';

const AUTO_SLIDE_MS = 3500; // how often the row slides by itself
const reduceMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** "Hear From Our Happy Customers" — a sliding row of real WhatsApp reviews. Tap one to see it full size. */
export default function CustomerReviews() {
  const reviews = CUSTOMER_REVIEWS;
  const n = reviews.length;
  const [open, setOpen] = useState(null); // index of the review shown full size, or null
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const closeRef = useRef(null);
  const openedFrom = useRef(null); // the card that was tapped, so focus can go back to it

  /** Slide the row one card left (-1) or right (1), wrapping around at the ends. */
  const slide = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('.cr-card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    const end = track.scrollWidth - track.clientWidth;
    const behavior = reduceMotion() ? 'auto' : 'smooth';
    if (dir > 0 && track.scrollLeft >= end - 4) track.scrollTo({ left: 0, behavior });
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: end, behavior });
    else track.scrollBy({ left: dir * step, behavior });
  };

  // Only slide by itself while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || open !== null || reduceMotion()) return;
    const t = setInterval(() => slide(1), AUTO_SLIDE_MS);
    return () => clearInterval(t);
  }, [inView, paused, open]);

  // Full-size viewer: lock page scroll, keyboard controls, and focus handling.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open === null, n]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(null);
    requestAnimationFrame(() => openedFrom.current?.focus());
  };

  if (!n) return null;
  const current = open !== null ? reviews[open] : null;

  return (
    <section ref={sectionRef} className="section section--ivory cr" id="reviews" aria-labelledby="cr-title">
      <div className="container">
        <Reveal className="cr__head">
          <div>
            <p className="eyebrow">Customer Reviews</p>
            <h2 id="cr-title" className="display">Hear From Our Happy <em>Customers</em></h2>
            <p className="cr__sub">Real messages from TimeTag customers. Tap any review to read it in full.</p>
          </div>
          <div className="cr__arrows">
            <button type="button" className="cr__arrow" onClick={() => slide(-1)} aria-label="Previous reviews">←</button>
            <button type="button" className="cr__arrow" onClick={() => slide(1)} aria-label="Next reviews">→</button>
          </div>
        </Reveal>

        <ul
          ref={trackRef}
          className="cr__track"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {reviews.map((r, i) => (
            <li key={r.id} className="cr-card">
              <button
                type="button"
                className="cr-card__shot"
                onClick={(e) => {
                  openedFrom.current = e.currentTarget;
                  setOpen(i);
                }}
              >
                <img src={r.image} alt={r.alt} loading="lazy" decoding="async" />
                <span className="cr-card__zoom" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6" /></svg>
                </span>
              </button>
              <p className="cr-card__meta">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" /></svg>
                Real customer review
              </p>
            </li>
          ))}
        </ul>
      </div>

      {current && (
        <div className="cr-viewer" role="dialog" aria-modal="true" aria-label={`Customer review ${open + 1} of ${n}`} onClick={close}>
          <button ref={closeRef} type="button" className="cr-viewer__close" onClick={close} aria-label="Close review">
            <CloseIcon size={22} />
          </button>
          <button
            type="button"
            className="cr-viewer__nav cr-viewer__nav--prev"
            aria-label="Previous review"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i - 1 + n) % n); }}
          >←</button>
          <figure className="cr-viewer__figure" key={current.id} onClick={(e) => e.stopPropagation()}>
            <img src={current.image} alt={current.alt} />
            <figcaption>{open + 1} / {n}</figcaption>
          </figure>
          <button
            type="button"
            className="cr-viewer__nav cr-viewer__nav--next"
            aria-label="Next review"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i + 1) % n); }}
          >→</button>
        </div>
      )}
    </section>
  );
}
