import { useLayoutEffect, useRef, useState } from 'react';
import { useAnnouncement } from '../lib/store.js';
import './AnnouncementBar.css';

const SPEED = 34; // sliding speed in pixels per second

function Group({ messages, hidden = false, groupRef }) {
  return (
    <ul className="announce__group" aria-hidden={hidden || undefined} ref={groupRef}>
      {messages.map((m, i) => (
        <li key={i} className="announce__item">
          {m}
          <span className="announce__sep" aria-hidden="true">◆</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Thin sliding banner above the header. The text is set in Admin → Settings.
 * One set of messages is measured, then repeated enough times to fill the screen, and the
 * row slides by exactly one set's width so the loop is seamless however long the text is.
 * `messages` can be passed in to preview text that hasn't been saved yet (used by the admin).
 */
export default function AnnouncementBar({ messages: previewMessages }) {
  const saved = useAnnouncement();
  const messages = previewMessages || (saved.show ? saved.messages : []);
  const groupRef = useRef(null);
  const [size, setSize] = useState({ width: 0, copies: 2 });
  const key = messages.join('\n');

  useLayoutEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.offsetWidth;
      const room = el.parentElement.parentElement.offsetWidth || window.innerWidth;
      if (width) setSize({ width, copies: Math.max(2, Math.ceil(room / width) + 1) });
    };
    measure();
    // re-measure when the font finishes loading or the window is resized
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [key]);

  if (!messages.length) return null;

  return (
    <div className="announce" role="region" aria-label="Store announcements">
      <div
        className={`announce__track${size.width ? ' is-ready' : ''}`}
        style={{ '--shift': `-${size.width}px`, '--dur': `${Math.max(8, size.width / SPEED)}s` }}
      >
        {Array.from({ length: size.copies }, (_, i) => (
          <Group key={i} messages={messages} hidden={i > 0} groupRef={i === 0 ? groupRef : undefined} />
        ))}
      </div>
    </div>
  );
}
