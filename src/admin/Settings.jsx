import { useEffect, useRef, useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar.jsx';
import {
  MAX_ANNOUNCEMENTS,
  MAX_ANNOUNCEMENT_LENGTH,
  resetAnnouncement,
  setAnnouncement,
  useAnnouncement,
} from '../lib/store.js';

/** Admin → Settings. For now: the sliding announcement bar above the header. */
export default function Settings() {
  const saved = useAnnouncement();
  const [show, setShow] = useState(saved.show);
  const [messages, setMessages] = useState(saved.messages);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  // if the saved text changes (another tab, or Reset), show it here
  useEffect(() => {
    setShow(saved.show);
    setMessages(saved.messages);
  }, [saved]);

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const changed = show !== saved.show || messages.join('\n') !== saved.messages.join('\n');
  const previewText = messages.map((m) => m.trim()).filter(Boolean);

  const edit = (i, value) => {
    setMessages((list) => list.map((m, k) => (k === i ? value : m)));
    setError('');
  };
  const move = (i, dir) =>
    setMessages((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (i) => setMessages((list) => list.filter((_, k) => k !== i));
  const add = () => {
    setMessages((list) => [...list, '']);
    // put the cursor in the new line
    requestAnimationFrame(() => document.getElementById(`adm-ann-${messages.length}`)?.focus());
  };

  const save = (e) => {
    e.preventDefault();
    const res = setAnnouncement({ show, messages });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError('');
    notify(show ? 'Announcement bar saved' : 'Announcement bar switched off');
  };

  const reset = () => {
    if (!window.confirm('Go back to the original announcement text? Your messages will be replaced.')) return;
    resetAnnouncement();
    setError('');
    notify('Announcement bar reset to the default text');
  };

  return (
    <>
      <header className="adm-head">
        <h1>Settings</h1>
      </header>

      <form className="adm-card adm-ann" onSubmit={save} noValidate aria-labelledby="adm-ann-title">
        <div className="adm-card__head">
          <h2 id="adm-ann-title">Announcement bar</h2>
          <label className="adm-check-row">
            <span className="adm-switch">
              <input type="checkbox" checked={show} onChange={(e) => { setShow(e.target.checked); setError(''); }} />
              <span aria-hidden="true" />
            </span>
            {show ? 'Shown on the store' : 'Switched off'}
          </label>
        </div>
        <p className="adm-hint adm-ann__hint">
          The gold strip that slides across the top of every store page. Keep each message short.
        </p>

        {/* live preview */}
        <div className={`adm-ann__preview${show ? '' : ' is-off'}`} aria-hidden="true">
          {show && previewText.length > 0 ? (
            <AnnouncementBar messages={previewText} />
          ) : (
            <p>{show ? 'Add a message to see the preview.' : 'The bar is switched off and won’t show on the store.'}</p>
          )}
        </div>

        <ol className="adm-ann__list">
          {messages.map((m, i) => (
            <li key={i} className="adm-ann__row">
              <span className="adm-ann__no">{i + 1}</span>
              <label className="sr-only" htmlFor={`adm-ann-${i}`}>Message {i + 1}</label>
              <input
                id={`adm-ann-${i}`}
                className="adm-input"
                value={m}
                maxLength={MAX_ANNOUNCEMENT_LENGTH}
                placeholder="e.g. Free shipping on all orders"
                onChange={(e) => edit(i, e.target.value)}
              />
              <div className="adm-ann__tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move message ${i + 1} up`}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === messages.length - 1} aria-label={`Move message ${i + 1} down`}>↓</button>
                <button type="button" onClick={() => remove(i)} aria-label={`Remove message ${i + 1}`}>✕</button>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="adm-btn adm-btn--sm" onClick={add} disabled={messages.length >= MAX_ANNOUNCEMENTS}>
          + Add message
        </button>
        {messages.length >= MAX_ANNOUNCEMENTS && <p className="adm-note">That’s the maximum of {MAX_ANNOUNCEMENTS} messages.</p>}

        {error && <p className="adm-save-err" role="alert">{error}</p>}

        <div className="adm-ann__foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={reset}>Reset to default text</button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            className="adm-btn"
            disabled={!changed}
            onClick={() => { setShow(saved.show); setMessages(saved.messages); setError(''); }}
          >
            Undo changes
          </button>
          <button type="submit" className="adm-btn adm-btn--gold" disabled={!changed}>Save</button>
        </div>
      </form>

      <div className={`adm-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
