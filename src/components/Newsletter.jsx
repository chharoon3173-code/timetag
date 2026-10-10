import { useState } from 'react';
import Reveal from './Reveal.jsx';
import './Newsletter.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | error | done

  const onSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }
    // TODO: send `email` to your mailing-list provider here.
    setStatus('done');
  };

  return (
    <section className="newsletter" aria-labelledby="news-title">
      <div className="container">
        <Reveal className="newsletter__box">
          <p className="eyebrow newsletter__eyebrow">The Private List</p>
          <h2 id="news-title" className="newsletter__title">Stay In <em>Time</em></h2>
          <p className="newsletter__text">
            Be the first to discover new collections, exclusive releases and private offers.
          </p>

          {status === 'done' ? (
            <p className="newsletter__thanks" role="status">Welcome to TimeTag. Your first letter is on its way.</p>
          ) : (
            <form className="newsletter__form" onSubmit={onSubmit} noValidate>
              <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                autoComplete="email"
                value={email}
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
              />
              <button type="submit" className="btn btn--gold">Join TimeTag</button>
            </form>
          )}
          {status === 'error' && (
            <p id="newsletter-error" className="newsletter__error" role="alert">Please enter a valid email address.</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
