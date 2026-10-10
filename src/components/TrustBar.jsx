import { LockIcon, ReturnIcon, ShieldIcon, TruckIcon } from './Icons.jsx';
import './TrustBar.css';

const ITEMS = [
  { Icon: TruckIcon, title: 'Free Shipping', text: 'On every order' },
  { Icon: ShieldIcon, title: '100% Authentic', text: 'Guaranteed genuine' },
  { Icon: ReturnIcon, title: 'Easy Returns', text: 'Hassle-free process' },
  { Icon: LockIcon, title: 'Secure Payments', text: 'Encrypted checkout' },
];

function Group({ hidden = false }) {
  return (
    <ul className="trust__group" aria-hidden={hidden || undefined}>
      {ITEMS.map(({ Icon, title, text }) => (
        <li key={title} className="trust__item">
          <span className="trust__icon"><Icon size={30} /></span>
          <span>
            <span className="trust__title">{title}</span>
            <span className="trust__text">{text}</span>
          </span>
          <span className="trust__sep" aria-hidden="true">◆</span>
        </li>
      ))}
    </ul>
  );
}

/** Continuously sliding strip. The list is repeated so the loop is seamless. */
export default function TrustBar() {
  return (
    <section className="trust" aria-label="Our promise">
      <div className="trust__viewport">
        <div className="trust__track">
          <Group />
          <Group hidden />
          <Group hidden />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}
