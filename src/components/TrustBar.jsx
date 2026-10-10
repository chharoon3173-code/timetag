import { LockIcon, ReturnIcon, ShieldIcon, TruckIcon } from './Icons.jsx';
import './TrustBar.css';

const ITEMS = [
  { Icon: TruckIcon, title: 'Free Shipping', text: 'On every order' },
  { Icon: ShieldIcon, title: '100% Authentic', text: 'Guaranteed genuine' },
  { Icon: ReturnIcon, title: 'Easy Returns', text: 'Hassle-free process' },
  { Icon: LockIcon, title: 'Secure Payments', text: 'Encrypted checkout' },
];

export default function TrustBar() {
  return (
    <section className="trust" aria-label="Our promise">
      <ul className="container trust__grid">
        {ITEMS.map(({ Icon, title, text }) => (
          <li key={title} className="trust__item">
            <span className="trust__icon"><Icon /></span>
            <div>
              <div className="trust__title">{title}</div>
              <div className="trust__text">{text}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
