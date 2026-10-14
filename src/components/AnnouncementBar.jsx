import './AnnouncementBar.css';

// Edit the sliding messages here.
const MESSAGES = [
  'Free shipping on all orders',
  '100% authentic — guaranteed genuine',
  'Easy, hassle-free returns',
  'Secure payments — encrypted checkout',
];

function Group({ hidden = false }) {
  return (
    <ul className="announce__group" aria-hidden={hidden || undefined}>
      {MESSAGES.map((m) => (
        <li key={m} className="announce__item">
          {m}
          <span className="announce__sep" aria-hidden="true">◆</span>
        </li>
      ))}
    </ul>
  );
}

/** Thin sliding banner above the header. The list is repeated so the loop is seamless. */
export default function AnnouncementBar() {
  return (
    <div className="announce" role="region" aria-label="Store announcements">
      <div className="announce__track">
        <Group />
        <Group hidden />
        <Group hidden />
        <Group hidden />
      </div>
    </div>
  );
}
