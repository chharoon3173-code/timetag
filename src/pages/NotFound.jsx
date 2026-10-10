import { useEffect } from 'react';
import { href } from '../lib/router.js';
import { Arrow } from '../components/Icons.jsx';

export default function NotFound({ title = 'Page not found', text = 'The page you’re looking for doesn’t exist or has moved.' }) {
  useEffect(() => {
    document.title = `${title} — TimeTag`;
  }, [title]);
  return (
    <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ justifyContent: 'center' }}>TimeTag</p>
        <h1 className="display">{title}</h1>
        <p style={{ color: 'var(--mute)', margin: '20px 0 36px' }}>{text}</p>
        <a href={href('/')} className="btn btn--gold">Back to the store <Arrow /></a>
      </div>
    </section>
  );
}
