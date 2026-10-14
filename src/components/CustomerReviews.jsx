import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { CloseIcon } from './Icons.jsx';
import { CUSTOMER_REVIEWS } from '../data/products.js';
import './CustomerReviews.css';

const SECONDS_PER_REVIEW = 5; // sliding speed: higher = slower

/** One copy of the review cards. The row shows two copies side by side so the loop is seamless. */
function ReviewGroup({ reviews, hidden = false, onOpen }) {
  return (
    <ul className="cr__group" aria-hidden={hidden || undefined}>
      {reviews.map((r, i) => (
        <li key={r.id} className="cr-card">
          <button
            type="button"
            className="cr-card__shot"
            tabIndex={hidden ? -1 : undefined}
            onClick={(e) => onOpen(i, e.currentTarget)}
          >
            <img src={r.image} alt={hidden ? '' : r.alt} loading="lazy" decoding="async" />
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
  );
}

/** "Hear From Our Happy Customers" — real WhatsApp reviews sliding continuously. Tap one to see it full size. */
export default function CustomerReviews() {
  const reviews = CUSTOMER_REVIEWS;
  const n = reviews.length;
  const [open, setOpen] = useState(null); // index of the review shown full size, or null
  const closeRef = useRef(null);
  const openedFrom = useRef(null); // the card that was tapped, so focus can go back to it

  const openReview = (i, el) => {
    openedFrom.current = el;
    setOpen(i);
  };
  const close = () => {
    setOpen(null);
    requestAnimationFrame(() => openedFrom.current?.focus());
  };

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

  if (!n) return null;
  const current = open !== null ? reviews[open] : null;

  return (
    <section className={`section section--ivory cr${current ? ' is-viewing' : ''}`} id="reviews" aria-labelledby="cr-title">
      <div className="container">
        <Reveal className="cr__head">
          <p className="eyebrow">Customer Reviews</p>
          <h2 id="cr-title" className="display">Hear From Our Happy <em>Customers</em></h2>
          <p className="cr__sub">Real messages from TimeTag customers. Tap any review to read it in full.</p>
        </Reveal>
      </div>

      {/* full-width sliding row (pauses while you hover over it) */}
      <div className="cr__viewport">
        <div className="cr__track" style={{ '--dur': `${n * SECONDS_PER_REVIEW}s` }}>
          <ReviewGroup reviews={reviews} onOpen={openReview} />
          <ReviewGroup reviews={reviews} onOpen={openReview} hidden />
        </div>
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
