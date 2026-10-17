import { useRef } from 'react';
import { handVars } from './Watch.jsx';
import { usePktStart } from '../lib/clock.js';
import './FeaturedCollection.css';

/*
 * A full-width decorative band: a photo of a watch (public/brand/feature-watch.jpg).
 * Hovering with a mouse tilts it gently towards the pointer, with light glinting across the glass.
 *
 * Moving hands (Pakistan time): the photo must be a version with its own hands removed.
 * When brand/feature-watch.jpg is that retouched photo, set PHOTO_HAS_NO_HANDS to true.
 */
const PHOTO_HAS_NO_HANDS = false;

// Measured on the photo (1254 × 1254 pixels): where the hands turn, and how far the dial is turned.
const PIVOT = { x: 569, y: 581 };
const DIAL_TURN = 6; // degrees clockwise — the photo's 12 o'clock isn't straight up

/** Hour, minute and seconds hands drawn in the photo's own pixel grid, turning with Pakistan time. */
function PhotoHands() {
  const start = usePktStart();
  const { x, y } = PIVOT;
  // a baton hand pointing at 12: `len` above the centre, `tail` below it, `w` wide
  const baton = (len, tail, w) =>
    `M${x - w / 2} ${y + tail} L${x - w / 2} ${y - len + w} L${x} ${y - len} L${x + w / 2} ${y - len + w} L${x + w / 2} ${y + tail} Z`;
  return (
    <svg className="feature__hands" viewBox="0 0 1254 1254" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fh-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#23262a" />
          <stop offset="0.5" stopColor="#a7adb3" />
          <stop offset="1" stopColor="#23262a" />
        </linearGradient>
        <radialGradient id="fh-cap" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#f4f5f6" />
          <stop offset="0.55" stopColor="#9aa0a6" />
          <stop offset="1" stopColor="#3b3f44" />
        </radialGradient>
        {/* soft shadow down and to the left, like the light in the photo */}
        <filter id="fh-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="-6" dy="7" stdDeviation="4" floodColor="#0b2233" floodOpacity="0.38" />
        </filter>
      </defs>
      <g transform={`rotate(${DIAL_TURN} ${x} ${y})`} filter="url(#fh-shadow)">
        <g key={start}>
          <g className="feature__hand" style={handVars(start, 43200)}>
            <path d={baton(240, 70, 26)} fill="url(#fh-steel)" />
            <rect x={x - 6} y={y - 222} width="12" height="182" rx="3" fill="#f6f6f2" />
          </g>
          <g className="feature__hand" style={handVars(start, 3600)}>
            <path d={baton(372, 70, 22)} fill="url(#fh-steel)" />
            <rect x={x - 5} y={y - 356} width="10" height="314" rx="3" fill="#f6f6f2" />
          </g>
          <g className="feature__hand" style={handVars(start, 60)}>
            <rect x={x - 2} y={y - 300} width="4" height="430" fill="#15171a" />
            <path d={`M${x} ${y - 366} L${x + 9} ${y - 300} L${x - 9} ${y - 300} Z`} fill="#15171a" />
            <rect x={x - 5} y={y + 108} width="10" height="26" rx="3" fill="#15171a" />
          </g>
        </g>
        <circle cx={x} cy={y} r="22" fill="url(#fh-cap)" />
        <circle cx={x} cy={y} r="7" fill="#5c6167" />
      </g>
    </svg>
  );
}

export default function FeaturedCollection() {
  const media = useRef(null);
  const watch = useRef(null);

  // mouse position over the band → how far to tilt, and where the light glints
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse' || !media.current || !watch.current) return;
    const r = media.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 (left) … 0.5 (right) of the band
    const py = (e.clientY - r.top) / r.height - 0.5; // -0.5 (top) … 0.5 (bottom)
    const w = watch.current.getBoundingClientRect(); // the glint is placed on the watch itself
    const gx = Math.min(1, Math.max(0, (e.clientX - w.left) / w.width));
    const gy = Math.min(1, Math.max(0, (e.clientY - w.top) / w.height));
    const s = media.current.style;
    s.setProperty('--tilt-x', `${(-py * 10).toFixed(2)}deg`);
    s.setProperty('--tilt-y', `${(px * 12).toFixed(2)}deg`);
    s.setProperty('--glare-x', `${(gx * 100).toFixed(1)}%`);
    s.setProperty('--glare-y', `${(gy * 100).toFixed(1)}%`);
  };
  const onPointerLeave = () => {
    const s = media.current?.style;
    if (!s) return;
    ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y'].forEach((v) => s.removeProperty(v));
  };

  return (
    <section className="feature" aria-hidden="true">
      <div className="feature__media" ref={media} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <div className="feature__watch" ref={watch}>
          <img className="feature__photo" src="brand/feature-watch.jpg" alt="" loading="lazy" />
          {PHOTO_HAS_NO_HANDS && <PhotoHands />}
          <span className="feature__glare" />
        </div>
        <div className="feature__vignette" />
      </div>
    </section>
  );
}
