import { useEffect, useRef, useState } from 'react';
import { addCollection, deleteCollection, updateCollection } from '../lib/store.js';
import { compressImage } from '../lib/images.js';

const LOGO_MAX_SIDE = 500; // logos are shown small, so they're kept small

const initials = (title) =>
  title.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

/** Side panel to add a collection, or rename / change the logo of / delete an existing one. */
export default function CollectionEditor({ collection, watchCount = 0, onClose, onSaved }) {
  const isNew = !collection;
  const [title, setTitle] = useState(collection?.title || '');
  const [image, setImage] = useState(collection?.image || null);
  const [error, setError] = useState('');
  const [logoMsg, setLogoMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function pickLogo(files) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setLogoMsg('Preparing logo…');
    try {
      setImage(await compressImage(file, LOGO_MAX_SIDE));
      setLogoMsg('');
    } catch (e) {
      setLogoMsg(e.message);
    }
    setBusy(false);
  }

  function save(e) {
    e.preventDefault();
    setError('');
    const res = isNew ? addCollection({ title, image }) : updateCollection(collection.id, { title, image });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved(isNew ? `${title.trim()} added` : `${title.trim()} saved`);
    onClose();
  }

  function remove() {
    const note = watchCount
      ? ` Its ${watchCount} watch${watchCount > 1 ? 'es' : ''} will be kept but will have no collection until you choose a new one.`
      : '';
    if (!window.confirm(`Delete the “${collection.title}” collection?${note}`)) return;
    const res = deleteCollection(collection.id);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved(`${collection.title} deleted`);
    onClose();
  }

  const shownTitle = title.trim() || 'Collection name';

  return (
    <div className="adm-panel-wrap" onClick={onClose}>
      <form
        className="adm-panel adm-editor"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add collection' : `Edit ${collection.title}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        noValidate
      >
        <header className="adm-panel__head">
          <div>
            <h2>{isNew ? 'Add a collection' : 'Edit collection'}</h2>
            <small>{isNew ? 'It appears on the home page as soon as you save.' : collection.title}</small>
          </div>
          <button type="button" className="adm-x" onClick={onClose} aria-label="Close">×</button>
        </header>

        {/* ---- Preview: how the tile looks on the home page ---- */}
        <section>
          <h3>Preview</h3>
          <div className="adm-colprev">
            <span className="adm-colprev__mark">
              {image ? <img src={image} alt="" /> : initials(shownTitle)}
            </span>
            <span className="adm-colprev__name">{shownTitle}</span>
          </div>
        </section>

        {/* ---- Details ---- */}
        <section className="adm-form">
          <h3>Details</h3>
          <label className="adm-field">
            <span>Collection name *</span>
            <input
              className={`adm-input${error && !title.trim() ? ' is-error' : ''}`}
              value={title}
              maxLength={40}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. Omega"
              autoFocus={isNew}
            />
          </label>

          <div className="adm-field">
            <span>Logo (optional)</span>
            <div
              className={`adm-drop${dragOver ? ' is-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); pickLogo(e.dataTransfer.files); }}
            >
              <p><strong>Drag a logo here</strong> or</p>
              <div className="adm-actions" style={{ marginTop: 0 }}>
                <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
                  {busy ? 'Preparing…' : image ? 'Change logo' : 'Choose logo'}
                </button>
                {image && (
                  <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setImage(null)}>Remove logo</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pickLogo(e.target.files); e.target.value = ''; }} />
              <small>A PNG with a transparent background looks best. Without a logo, the initials are shown.</small>
            </div>
            {logoMsg && <p className="adm-note" role="status">{logoMsg}</p>}
          </div>
        </section>

        {error && <p className="adm-save-err" role="alert">{error}</p>}

        <footer className="adm-editor__foot">
          {!isNew && (
            <button type="button" className="adm-btn adm-btn--danger" onClick={remove}>Delete</button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn adm-btn--gold" disabled={busy}>{isNew ? 'Add collection' : 'Save changes'}</button>
        </footer>
      </form>
    </div>
  );
}
