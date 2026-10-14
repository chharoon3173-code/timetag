import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ProductVisual } from './Watch.jsx';
import Grain from './Grain.jsx';
import { Arrow } from './Icons.jsx';
import { addToCart, openCart } from '../lib/store.js';
import { formatPrice } from '../data/products.js';
import { href } from '../lib/router.js';
import './SignatureCollection.css';

const AUTO_TURN_MS = 5000; // how often the bezel turns by itself
const FLIGHT_MS = 1000; // how long a watch takes to fly from the ring to the middle
const mod = (n, m) => ((n % m) + m) % m;
const pad = (n) => String(n).padStart(2, '0');
const reduceMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * "Our Signature Collection" — watches sit around a rotating bezel.
 * Drag the bezel (or tap a watch / use the arrows) to bring one to 12 o'clock.
 *
 * How it works: `pos` is how many steps the bezel has turned. It is allowed to grow past the
 * number of watches (…, 5, 6, 7…) so the bezel always turns the short way round, never jumps back.
 *
 * The "flight": when a watch is chosen, we remember where its small picture is on screen, then
 * animate the big middle watch from that spot to the centre (a technique called FLIP).
 */
export default function SignatureCollection({ products }) {
  const n = products.length;
  const step = 360 / Math.max(n, 1); // degrees between two watches
  const [pos, setPos] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [added, setAdded] = useState(false);
  const [flight, setFlight] = useState(null); // { id, from } — a watch flying from the ring to the middle
  const [leaving, setLeaving] = useState(null); // { product, key } — the previous middle watch fading out
  const [burst, setBurst] = useState(0); // counts landings, to replay the gold pulse

  const sectionRef = useRef(null);
  const dialRef = useRef(null);
  const centerRef = useRef(null);
  const thumbRefs = useRef([]);
  const posRef = useRef(0);
  const prevProduct = useRef(null);
  const drag = useRef(null);
  const justDragged = useRef(false);

  const active = n ? mod(Math.round(pos), n) : 0;
  const product = products[active];

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  /** Turn the bezel to `target` and, if a different watch is chosen, launch it from the ring. */
  const turnTo = (target) => {
    const i = mod(target, n);
    if (i !== mod(Math.round(posRef.current), n) && !reduceMotion()) {
      const pic = thumbRefs.current[i]?.querySelector('.watch-svg, .product-photo');
      if (pic) setFlight({ id: products[i].id, from: pic.getBoundingClientRect() });
    }
    setPos(target);
  };
  const turnRef = useRef(turnTo);
  turnRef.current = turnTo; // so the auto-turn timer always uses the latest version

  const next = () => turnTo(Math.round(posRef.current) + 1);
  const prev = () => turnTo(Math.round(posRef.current) - 1);
  const goTo = (i) => {
    const now = Math.round(posRef.current);
    let d = i - mod(now, n);
    if (d > n / 2) d -= n; // take the shorter way round
    if (d < -n / 2) d += n;
    turnTo(now + d);
  };

  // Only turn by itself while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || dragging || n < 2 || reduceMotion()) return;
    const t = setInterval(() => turnRef.current(Math.round(posRef.current) + 1), AUTO_TURN_MS);
    return () => clearInterval(t);
  }, [inView, paused, dragging, n]);

  useEffect(() => setAdded(false), [active]);

  // Each time the middle watch changes: fade the old one out, and fly (or fade) the new one in.
  useLayoutEffect(() => {
    const prevP = prevProduct.current;
    prevProduct.current = product;
    if (!prevP || !product || prevP.id === product.id || reduceMotion()) return;

    setLeaving({ product: prevP, key: `${prevP.id}-${Date.now()}` });
    const el = centerRef.current;
    if (!el?.animate) return;

    if (flight && flight.id === product.id) {
      // FLIP: start where the small picture was, end in the middle
      const to = el.getBoundingClientRect();
      const from = flight.from;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const s = from.width / to.width;
      const base = 'translate(-50%, -50%)';
      const anim = el.animate(
        [
          // lift off gently, glide across the dial…
          { transform: `${base} translate(${dx}px, ${dy}px) scale(${s}) rotate(-14deg)`, opacity: 0.9, easing: 'cubic-bezier(0.55, 0, 0.3, 1)' },
          // …overshoot slightly…
          { offset: 0.78, transform: `${base} scale(1.07) rotate(3deg)`, opacity: 1, easing: 'cubic-bezier(0.3, 0, 0.3, 1)' },
          // …and settle
          { transform: `${base} scale(1) rotate(0deg)`, opacity: 1 },
        ],
        { duration: FLIGHT_MS }
      );
      const landedId = product.id;
      anim.onfinish = () => {
        setFlight((f) => (f?.id === landedId ? null : f));
        setBurst((b) => b + 1);
      };
      return () => {
        anim.cancel();
        setFlight((f) => (f?.id === landedId ? null : f));
      };
    }

    // changed by dragging: a simple fade-in
    el.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -46%) scale(0.92)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      ],
      { duration: 600, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
    );
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- dragging the bezel ---------- */
  const angleAt = (e) => {
    const r = dialRef.current.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onPointerDown = (e) => {
    if (n < 2 || e.button > 0) return;
    const a = angleAt(e);
    drag.current = { last: a, turned: 0, startPos: pos, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const a = angleAt(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    d.turned += delta;
    if (!d.moved && Math.abs(d.turned) > 3) {
      d.moved = true;
      setDragging(true);
      setFlight(null);
      dialRef.current.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) setPos(d.startPos - d.turned / step); // clockwise drag = bezel turns clockwise
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    justDragged.current = true; // stop the release from also counting as a tap on a watch
    setTimeout(() => (justDragged.current = false), 0);
    setDragging(false);
    setPos((p) => Math.round(p)); // snap to the nearest watch
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  const handleAdd = () => {
    if (addToCart(product.id, 1)) {
      setAdded(true);
      openCart();
    }
  };

  if (!n) return null;
  const soldOut = product.stock <= 0;

  return (
    <section
      ref={sectionRef}
      className="section sig"
      id="signature"
      aria-labelledby="sig-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <Grain />
      <div className="container">
        <header className="sig__head">
          <p className="eyebrow">Featured</p>
          <h2 id="sig-title" className="display">Our Signature <em>Collection</em></h2>
        </header>

        <div className="sig__layout">
          {/* ---------- the dial ---------- */}
          <div
            ref={dialRef}
            className={`sig__dial${dragging ? ' is-dragging' : ''}`}
            style={{ '--rot': `${-pos * step}deg` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="sig__bezel" aria-hidden="true" />
            <span className="sig__pointer" aria-hidden="true" />

            <ul className="sig__ring">
              {products.map((p, i) => (
                <li key={p.id} className="sig__slot" style={{ '--a': `${i * step}deg` }}>
                  <button
                    type="button"
                    ref={(el) => (thumbRefs.current[i] = el)}
                    className={`sig__thumb${i === active ? ' is-active' : ''}${flight?.id === p.id ? ' is-launching' : ''}`}
                    aria-label={`Show ${p.name}`}
                    aria-pressed={i === active}
                    onClick={() => !justDragged.current && goTo(i)}
                  >
                    <ProductVisual product={p} />
                  </button>
                </li>
              ))}
            </ul>

            {burst > 0 && <span key={burst} className="sig__burst" aria-hidden="true" />}

            {leaving && (
              <span
                key={leaving.key}
                className="sig__center sig__center--out"
                aria-hidden="true"
                onAnimationEnd={() => setLeaving(null)}
              >
                <ProductVisual product={leaving.product} />
              </span>
            )}

            <a
              ref={centerRef}
              href={href(`/product/${product.id}`)}
              className="sig__center"
              key={product.id}
              aria-label={`View ${product.name}`}
            >
              <ProductVisual product={product} />
            </a>
          </div>

          {/* ---------- details of the watch at 12 o'clock ---------- */}
          <div className="sig__info">
            <p className="sig__count">
              <span>{pad(active + 1)}</span> / {pad(n)}
            </p>
            <div className="sig__text" key={product.id} aria-live="polite">
              {product.collection && <p className="sig__coll">{product.collection}</p>}
              <h3 className="sig__name">{product.name}</h3>
              <p className="sig__desc">{product.description}</p>
              <p className="sig__price">
                {formatPrice(product.price)}
                {soldOut && <em>Sold out</em>}
              </p>
            </div>
            <div className="sig__actions">
              <a href={href(`/product/${product.id}`)} className="btn btn--gold">View watch <Arrow /></a>
              <button type="button" className="btn btn--outline" onClick={handleAdd} disabled={soldOut}>
                {soldOut ? 'Sold out' : added ? 'Added ✓' : 'Add to bag'}
              </button>
            </div>
            <div className="sig__nav">
              <button type="button" className="sig__arrow" onClick={prev} aria-label="Previous watch">←</button>
              <button type="button" className="sig__arrow" onClick={next} aria-label="Next watch">→</button>
              <span className="sig__hint">Drag the bezel or tap a watch</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
