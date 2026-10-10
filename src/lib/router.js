/**
 * Minimal hash router. Works on GitHub Pages with no server config.
 *   #/                     → home
 *   #/product/<id>         → product page
 *   #/checkout             → checkout
 *   #/thank-you/<orderId>  → order confirmation
 *   #/admin                → admin panel
 * Plain anchors like #edit or #collections still scroll on the home page.
 */
import { useEffect, useState } from 'react';

function parse() {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/')) {
    const path = hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
    return { path, anchor: null };
  }
  return { path: '/', anchor: hash.length > 1 ? decodeURIComponent(hash.slice(1)) : null };
}

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/** Returns params if `path` matches `pattern` (e.g. '/product/:id'), else null. */
export function match(pattern, path) {
  const a = pattern.split('/').filter(Boolean);
  const b = path.split('/').filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export const href = (path) => `#${path}`;

export function navigate(path) {
  window.location.hash = path;
}
