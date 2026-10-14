import { useMemo } from 'react';
import { BrandLockup, InstagramIcon, TikTokIcon } from './Icons.jsx';
import { useCollections } from '../lib/store.js';
import { href } from '../lib/router.js';
import './Footer.css';

const SHOP = { title: 'Shop', links: [['All Watches', '#edit'], ["Men's", '#edit'], ["Women's", '#edit'], ['New Arrivals', '#edit'], ['Best Sellers', '#edit']] };
// The "Collections" column is filled in from Admin → Collections (see Footer below).
const OTHER_COLUMNS = [
  { title: 'Customer Care', links: [['Shipping', '#contact'], ['Returns', '#contact'], ['Warranty', '#contact'], ['Watch Care', '#contact'], ['FAQ', '#contact']] },
  { title: 'About', links: [['Our Story', '#story'], ['Journal', '#story'], ['Contact', '#contact'], ['Store Locator', '#contact']] },
];

// Your social profiles (open in a new tab). FacebookIcon and YouTubeIcon are also in Icons.jsx if you add those later.
const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/timetag.official/', Icon: InstagramIcon },
  { label: 'TikTok', href: 'https://www.tiktok.com/@timetag.official', Icon: TikTokIcon },
];

export default function Footer() {
  const collections = useCollections();
  const columns = useMemo(
    () => [SHOP, { title: 'Collections', links: collections.map((c) => [c.title, href(`/collection/${c.id}`)]) }, ...OTHER_COLUMNS],
    [collections]
  );
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a href="#top" className="brand" aria-label="TimeTag home">
              <BrandLockup lionHeight={96} wordWidth={170} stacked />
            </a>
            <p className="footer__statement">
              Timepieces chosen for character — made to be worn, kept and remembered.
            </p>
            <div className="footer__social">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a key={label} href={href} aria-label={`TimeTag on ${label}`} target="_blank" rel="noreferrer"><Icon /></a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="footer__col" aria-label={col.title}>
              <h4>{col.title}</h4>
              {col.links.map(([label, href]) => (
                <a key={label} href={href}>{label}</a>
              ))}
            </nav>
          ))}
        </div>

        <div className="footer__bottom">
          <p>© 2026 TimeTag. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#contact">Privacy</a>
            <a href="#contact">Terms</a>
            <a href="#contact">Cookies</a>
            <a href="#/admin">Staff login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
