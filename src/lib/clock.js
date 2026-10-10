/**
 * Pakistan Standard Time (PKT) for the watch hands.
 * PKT is always UTC+5 (Pakistan doesn't use daylight saving), so it's computed from UTC directly —
 * the hands show Pakistan time no matter where the visitor is.
 */
import { useEffect, useState } from 'react';

const PKT_OFFSET_SECONDS = 5 * 3600;

/** Seconds since midnight in Pakistan, including milliseconds. */
export function pktSecondsOfDay(now = Date.now()) {
  return ((now / 1000 + PKT_OFFSET_SECONDS) % 86400 + 86400) % 86400;
}

/**
 * Returns the PKT time captured when the watch appeared. The hands are then driven by CSS
 * animations (smooth, no per-frame JavaScript); this re-syncs when the tab becomes visible again
 * and every 10 minutes so they never drift.
 */
export function usePktStart() {
  const [start, setStart] = useState(pktSecondsOfDay);
  useEffect(() => {
    const resync = () => document.visibilityState === 'visible' && setStart(pktSecondsOfDay());
    document.addEventListener('visibilitychange', resync);
    const t = setInterval(resync, 10 * 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', resync);
      clearInterval(t);
    };
  }, []);
  return start;
}

/** "21:58:03"-style PKT time string. */
export function pktTimeString(now = Date.now()) {
  const s = Math.floor(pktSecondsOfDay(now));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
