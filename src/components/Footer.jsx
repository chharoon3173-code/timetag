import { FacebookIcon, InstagramIcon, Logo, TikTokIcon, YouTubeIcon } from './Icons.jsx';
import './Footer.css';

const COLUMNS = [
  { title: 'Shop', links: [['All Watches', '#edit'], ["Men's", '#edit'], ["Women's", '#edit'], ['New Arrivals', '#edit'], ['Best Sellers', '#edit']] },
  { title: 'Collections', links: [['The Classics', '#collections'], ['Modern Icons', '#collections'], ['Chronographs', '#collections'], ['Everyday Essentials', '#collections']] },
  { title: 'Customer Care', links: [['Shipping', '#contact'], ['Returns', '#contact'], ['Warranty', '#contact'], ['Watch Care', '#contact'], ['FAQ', '#contact']] },
  { title: 'About', links: [['Our Story', '#story'], ['Journal', '#story'], ['Contact', '#contact'], ['Store Locator', '#contact']] },
];

// Replace '#' with your real profile URLs.
const SOCIAL = [
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'TikTok', href: '#', Icon: TikTokIcon },
  { label: 'YouTube', href: '#', Icon: YouTubeIcon },
];

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a href="#top" className="brand" aria-label="TimeTag home">
              <Logo />
              <span className="brand__word">TIMETAG</span>
            </a>
            <p className="footer__statement">
              Timepieces chosen for character — made to be worn, kept and remembered.
            </p>
            <div className="footer__social">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a key={label} href={href} aria-label={label}><Icon /></a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
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
          </div>
        </div>
      </div>
    </footer>
  );
}
