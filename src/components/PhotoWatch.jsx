import { useId } from 'react';
import { handVars, usePktStart } from '../lib/clock.js';

/**
 * A real watch photo with live Pakistan-time hands drawn over the dial.
 * Works with any cut-out photo whose printed hands were removed — just give it the dial centre & radius.
 */
export default function PhotoWatch({ watch, className = '' }) {
  const start = usePktStart();
  const uid = useId().replace(/:/g, '');
  const { width: w, height: h, pivot: [x, y], radius: r, rotation = 0 } = watch;

  // tapered baton hand pointing to 12, from a little behind the pivot to `len`
  const baton = (len, base, tip) =>
    `M${x - base} ${y + r * 0.12} L${x - tip} ${y - len + tip * 2.2} L${x} ${y - len} L${x + tip} ${y - len + tip * 2.2} L${x + base} ${y + r * 0.12} Z`;
  const origin = { '--ox': `${x}px`, '--oy': `${y}px` };

  return (
    <div className={`photo-watch ${className}`} style={{ aspectRatio: `${w} / ${h}` }}>
      <img src={watch.image} alt={watch.name} width={w} height={h} decoding="async" fetchpriority="high" />
      <svg className="photo-watch__hands" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`rg-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b77c62" />
            <stop offset="0.45" stopColor="#f6d6c3" />
            <stop offset="0.55" stopColor="#e2ad92" />
            <stop offset="1" stopColor="#9d6650" />
          </linearGradient>
          <filter id={`sh-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx={r * 0.02} dy={r * 0.035} stdDeviation={r * 0.018} floodColor="#000" floodOpacity="0.55" />
          </filter>
        </defs>
        <g key={start} filter={`url(#sh-${uid})`} transform={`rotate(${rotation} ${x} ${y})`}>
          <g className="photo-hand" style={{ ...handVars(start, 43200), ...origin }}>
            <path d={baton(r * 0.55, r * 0.05, r * 0.045)} fill={`url(#rg-${uid})`} stroke="#6e4434" strokeWidth={r * 0.006} />
            <rect x={x - r * 0.012} y={y - r * 0.47} width={r * 0.024} height={r * 0.34} fill="#e9f0e4" opacity="0.85" />
          </g>
          <g className="photo-hand" style={{ ...handVars(start, 3600), ...origin }}>
            <path d={baton(r * 0.86, r * 0.038, r * 0.034)} fill={`url(#rg-${uid})`} stroke="#6e4434" strokeWidth={r * 0.006} />
            <rect x={x - r * 0.01} y={y - r * 0.77} width={r * 0.02} height={r * 0.6} fill="#e9f0e4" opacity="0.85" />
          </g>
          <g className="photo-hand" style={{ ...handVars(start, 60), ...origin }}>
            <line x1={x} y1={y + r * 0.2} x2={x} y2={y - r * 0.9} stroke={`url(#rg-${uid})`} strokeWidth={r * 0.014} strokeLinecap="round" />
            <circle cx={x} cy={y - r * 0.68} r={r * 0.035} fill="#e9f0e4" stroke="#b77c62" strokeWidth={r * 0.01} />
          </g>
          <circle cx={x} cy={y} r={r * 0.055} fill={`url(#rg-${uid})`} stroke="#6e4434" strokeWidth={r * 0.006} />
        </g>
      </svg>
    </div>
  );
}
