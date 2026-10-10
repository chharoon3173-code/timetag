import { useEffect, useState } from 'react';
import { BagIcon, BrandLockup, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx';
import './Header.css';

const NAV = [
  { label: 'Home', href: '#top' },
  { label: 'Shop', href: '#edit' },
  { label: 'Collections', href: '#collections' },
  { label: 'About', href: '#story' },
  { label: 'Contact', href: '#contact' },
];

export default function Header({ wishlistCount = 0, bagCount = 0, onBagClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container site-header__inner">
          <a href="#top" className="brand" aria-label="TimeTag home">
            <BrandLockup lionHeight={54} wordWidth={140} />
          </a>

          <nav className="main-nav" aria-label="Main">
            {NAV.map((item, i) => (
              <a key={item.label} href={item.href} className={i === 0 ? 'is-current' : undefined}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-icons">
            <button type="button" className="icon-btn" aria-label="Search"><SearchIcon /></button>
            <button type="button" className="icon-btn hide-mobile" aria-label="Account"><UserIcon /></button>
            <button type="button" className="icon-btn hide-mobile" aria-label={`Wishlist, ${wishlistCount} items`}>
              <HeartIcon />
              {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
            </button>
            <button type="button" className="icon-btn" aria-label={`Shopping bag, ${bagCount} items`} onClick={onBagClick}>
              <BagIcon />
              {bagCount > 0 && <span className="icon-badge">{bagCount}</span>}
            </button>
            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would trap a fixed child */}
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`} hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV.map((item, i) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{ animationDelay: `${i * 60}ms` }}>
              {item.label}
            </a>
          ))}
        </nav>
        <p className="mobile-menu__foot">More than just time.</p>
      </div>
    </>
  );
}
