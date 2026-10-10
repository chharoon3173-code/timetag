import { useId } from 'react';

/**
 * Vector watch render used until real product photography is added.
 * `style` is one of WATCH_STYLES from data/products.js.
 */
export default function Watch({ style, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const s = style;
  const id = (name) => `${name}-${uid}`;
  const url = (name) => `url(#${id(name)})`;

  return (
    <svg className={`watch-svg ${className}`} viewBox="0 0 240 360" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id('case')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={s.caseA} />
          <stop offset="0.4" stopColor={s.caseB} />
          <stop offset="0.6" stopColor={s.caseC} />
          <stop offset="1" stopColor={s.caseA} />
        </linearGradient>
        <linearGradient id={id('caseInv')} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={s.caseA} />
          <stop offset="0.5" stopColor={s.caseB} />
          <stop offset="1" stopColor={s.caseA} />
        </linearGradient>
        <radialGradient id={id('dial')} cx="0.36" cy="0.3" r="0.85">
          <stop offset="0" stopColor={s.dialA} />
          <stop offset="1" stopColor={s.dialB} />
        </radialGradient>
        <linearGradient id={id('strap')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={s.strapA} />
          <stop offset="0.5" stopColor={s.strapB} />
          <stop offset="1" stopColor={s.strapA} />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* strap */}
      <rect x="82" y="0" width="76" height="118" rx="5" fill={url('strap')} />
      <rect x="82" y="242" width="76" height="118" rx="5" fill={url('strap')} />
      {s.bracelet ? (
        <g stroke="#000" strokeOpacity="0.32" strokeWidth="1" fill="none">
          {[18, 38, 58, 78, 98, 262, 282, 302, 322, 342].map((y) => (
            <line key={y} x1="82" y1={y} x2="158" y2={y} />
          ))}
          <line x1="106" y1="0" x2="106" y2="118" /><line x1="134" y1="0" x2="134" y2="118" />
          <line x1="106" y1="242" x2="106" y2="360" /><line x1="134" y1="242" x2="134" y2="360" />
        </g>
      ) : (
        <g stroke="#d8c7a6" strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="3 3" fill="none">
          <line x1="88" y1="4" x2="88" y2="104" /><line x1="152" y1="4" x2="152" y2="104" />
          <line x1="88" y1="256" x2="88" y2="356" /><line x1="152" y1="256" x2="152" y2="356" />
        </g>
      )}

      {/* lugs, pushers, crown */}
      <rect x="74" y="86" width="92" height="46" rx="10" fill={url('case')} />
      <rect x="74" y="228" width="92" height="46" rx="10" fill={url('caseInv')} />
      {s.chronograph && (
        <>
          <rect x="186" y="122" width="12" height="16" rx="2" fill={url('case')} transform="rotate(45 192 130)" />
          <rect x="186" y="222" width="12" height="16" rx="2" fill={url('case')} transform="rotate(-45 192 230)" />
        </>
      )}
      <rect x="200" y="168" width="14" height="24" rx="3" fill={url('case')} />
      <g stroke="#000" strokeOpacity="0.35" strokeWidth="0.6">
        <line x1="203" y1="170" x2="203" y2="190" /><line x1="207" y1="170" x2="207" y2="190" /><line x1="211" y1="170" x2="211" y2="190" />
      </g>

      {/* case, bezel, dial */}
      <circle cx="120" cy="180" r="88" fill={url('case')} />
      <circle cx="120" cy="180" r="88" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="0.8" />
      <circle cx="120" cy="180" r="79" fill={s.bezel} />
      <circle cx="120" cy="180" r="79" fill="none" stroke={url('caseInv')} strokeWidth="1.6" />
      <circle cx="120" cy="180" r="71" fill={url('dial')} />
      <circle cx="120" cy="180" r="66" fill="none" stroke={s.ticks} strokeWidth="3" strokeDasharray="0.9 6.0115" strokeDashoffset="0.45" opacity="0.75" />
      <circle cx="120" cy="180" r="60" fill="none" stroke={s.accent} strokeWidth="9" strokeDasharray="2.6 28.816" strokeDashoffset="1.3" />
      <rect x="116" y="113" width="8" height="12" fill={s.accent} />

      {s.chronograph && (
        <g fill="none" stroke={s.ticks} strokeWidth="0.8">
          {[[93, 180, -40], [147, 180, 70], [120, 208, 150]].map(([cx, cy, a]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r="13" opacity="0.8" />
              <circle cx={cx} cy={cy} r="10" strokeDasharray="0.6 2.54" opacity="0.6" />
              <line x1={cx} y1={cy} x2={cx} y2={cy - 10} stroke={s.accent} strokeWidth="1.2" transform={`rotate(${a} ${cx} ${cy})`} />
            </g>
          ))}
        </g>
      )}

      <text x="120" y="150" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="9" letterSpacing="2.2" fill={s.hands} fontWeight="500">TIMETAG</text>
      {s.chronograph ? (
        <text x="120" y="160" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="4.2" letterSpacing="1.6" fill={s.accent}>CHRONOGRAPH</text>
      ) : (
        <text x="120" y="222" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="4.6" letterSpacing="1.8" fill={s.hands}>AUTOMATIC</text>
      )}

      {/* hands at 10:10 */}
      <path d="M116.6 184 L120 134 L123.4 184 Z" fill={s.hands} transform="rotate(-58 120 180)" />
      <path d="M118 186 L120 121 L122 186 Z" fill={s.hands} transform="rotate(62 120 180)" />
      <line className="watch-seconds" x1="120" y1="198" x2="120" y2="122" stroke={s.accent} strokeWidth="1" />
      <circle cx="120" cy="180" r="4.6" fill={s.hands} />
      <circle cx="120" cy="180" r="1.8" fill={s.accent} />

      {/* glass */}
      <circle cx="120" cy="180" r="71" fill={url('glass')} />
      <ellipse cx="96" cy="146" rx="36" ry="14" fill="#fff" opacity="0.05" transform="rotate(-32 96 146)" />
    </svg>
  );
}

/** Shows the product photo if one is set, otherwise the vector watch. */
export function ProductVisual({ product, className = '' }) {
  if (product.image) {
    return <img className={`product-photo ${className}`} src={product.image} alt={product.name} loading="lazy" />;
  }
  return <Watch style={product.watch} className={className} />;
}
