import Reveal from './Reveal.jsx';
import { Stars } from './Icons.jsx';
import { REVIEWS } from '../data/products.js';
import './Reviews.css';

export default function Reviews() {
  return (
    <section className="section section--ivory" aria-labelledby="reviews-title">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">Customer Reviews</p>
            <h2 id="reviews-title" className="display">Worn. Loved. <em>Remembered.</em></h2>
          </div>
        </Reveal>
        <div className="reviews">
          {REVIEWS.map((r, i) => (
            <Reveal as="figure" key={r.id} delay={i * 120} className="review">
              <span className="review__mark" aria-hidden="true">“</span>
              <blockquote>{r.quote}</blockquote>
              <Stars rating={r.rating} />
              <figcaption className="review__who">
                {r.avatar ? (
                  <img className="review__avatar" src={r.avatar} alt="" />
                ) : (
                  <span className="review__avatar" aria-hidden="true">{r.initial}</span>
                )}
                <span>
                  <span className="review__name">{r.name}</span>
                  <span className="review__meta">Verified buyer · {r.product}</span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
