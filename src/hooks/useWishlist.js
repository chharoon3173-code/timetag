import { useCallback, useEffect, useState } from 'react';

const KEY = 'timetag:wishlist';

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Wishlist of product ids, remembered in the browser between visits. */
export default function useWishlist() {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* storage unavailable (private mode) — keep it in memory only */
    }
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return { ids, count: ids.length, toggle, has };
}
