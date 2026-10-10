// Thin line icons (stroke = currentColor) so they pick up hover colours.
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };

const Svg = ({ size = 20, sw = 1.3, vb = 24, children, ...rest }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} strokeWidth={sw} {...base} {...rest}>
    {children}
  </svg>
);

export const SearchIcon = (p) => <Svg {...p}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></Svg>;
export const UserIcon = (p) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></Svg>;
export const BagIcon = (p) => <Svg {...p}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Svg>;
export const MenuIcon = (p) => <Svg {...p}><path d="M3 8h18M3 16h18" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M5 5l14 14M19 5 5 19" /></Svg>;
export const HeartIcon = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
  </Svg>
);

export const TruckIcon = (p) => <Svg vb={32} size={34} sw={1} {...p}><path d="M2 9h17v13H2zM19 13h6l4 5v4h-10" /><circle cx="8" cy="24" r="2.5" /><circle cx="24" cy="24" r="2.5" /></Svg>;
export const ShieldIcon = (p) => <Svg vb={32} size={34} sw={1} {...p}><path d="M16 3 5 7v8c0 7 4.8 11.6 11 14 6.2-2.4 11-7 11-14V7L16 3Z" /><path d="m11 16 3.5 3.5L21 13" /></Svg>;
export const ReturnIcon = (p) => <Svg vb={32} size={34} sw={1} {...p}><path d="M6 12h16a6 6 0 0 1 0 12h-8" /><path d="m11 7-5 5 5 5" /></Svg>;
export const LockIcon = (p) => <Svg vb={32} size={34} sw={1} {...p}><rect x="6" y="14" width="20" height="14" /><path d="M10 14V10a6 6 0 0 1 12 0v4" /><circle cx="16" cy="21" r="1.6" /></Svg>;

export const InstagramIcon = (p) => <Svg size={18} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></Svg>;
export const FacebookIcon = (p) => <Svg size={18} {...p}><path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.8 1.8-1.8h1.8V2.6c-.4 0-1.5-.1-2.7-.1-2.7 0-4.4 1.6-4.4 4.6v2.4H7.5V13h3v8" /></Svg>;
export const TikTokIcon = (p) => <Svg size={18} {...p}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.5 2.8 2.3 4.6 5 5" /></Svg>;
export const YouTubeIcon = (p) => <Svg size={18} {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="m10 9.2 5 2.8-5 2.8z" /></Svg>;

export const Arrow = () => <span className="arrow" aria-hidden="true">→</span>;

export function Stars({ rating = 5, className = '' }) {
  return (
    <span className={`stars ${className}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export function Logo({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" aria-hidden="true" focusable="false">
      <circle cx="23" cy="23" r="22" fill="none" stroke="#C9A96E" strokeWidth="0.8" />
      <circle cx="23" cy="23" r="18.5" fill="none" stroke="#C9A96E" strokeWidth="0.4" opacity="0.6" />
      <text x="18.5" y="28.6" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="16" fill="#F4EFE6" fontWeight="500">T</text>
      <text x="27" y="28.6" textAnchor="middle" fontFamily="Poppins, sans-serif" fontSize="16" fill="#C9A96E" fontStyle="italic">T</text>
    </svg>
  );
}
