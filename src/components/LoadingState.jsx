import { loadCatalog } from '../lib/store.js';

/**
 * Shown while the watches are loading from the database, or if they couldn't be loaded.
 * `error`: the message to show instead, with a "Try again" button.
 */
export default function LoadingState({ text = 'Loading…', error = '', inline = false }) {
  const Tag = inline ? 'div' : 'section';
  return (
    <Tag className={`loading-state${inline ? ' loading-state--inline' : ''}`} aria-busy={!error} role={error ? 'alert' : 'status'}>
      <div className="container">
        {error ? (
          <>
            <p>{error}</p>
            <button type="button" className="text-link" onClick={() => loadCatalog()}>Try again</button>
          </>
        ) : (
          <p><span className="loading-state__dot" aria-hidden="true" />{text}</p>
        )}
      </div>
    </Tag>
  );
}
