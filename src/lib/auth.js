/**
 * Admin login.
 *
 * The password is NOT stored in the code — only its SHA-256 fingerprint.
 * To change the password, run this in any browser console and paste the result below:
 *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('NEW_PASSWORD'))
 *     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
 *
 * ⚠️  Without a server, this check runs in the visitor's browser, so it keeps casual
 *     visitors out but is not real security. Move login to a backend before storing
 *     real customer data.
 */
const ADMIN_USERNAME = 'haroonscales';
const ADMIN_PASSWORD_SHA256 = '28cd33a90d61efa9ce6733201b44344074717b401d8517a82128152a56fb8054';

const SESSION_KEY = 'timetag:admin-session';
const LOCK_KEY = 'timetag:admin-lock';
const SESSION_HOURS = 8;
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readJSON(storage, key) {
  try {
    return JSON.parse(storage.getItem(key)) || null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const s = readJSON(window.sessionStorage, SESSION_KEY);
  return !!s && s.expires > Date.now();
}

/** Seconds left on a lockout after too many wrong attempts (0 = not locked). */
export function lockSecondsLeft() {
  const l = readJSON(window.localStorage, LOCK_KEY);
  if (!l?.until) return 0;
  return Math.max(0, Math.ceil((l.until - Date.now()) / 1000));
}

export async function login(username, password) {
  if (lockSecondsLeft() > 0) return { ok: false, error: `Too many attempts. Try again in ${lockSecondsLeft()}s.` };
  if (!window.crypto?.subtle) return { ok: false, error: 'Login needs a secure (https) connection.' };

  const ok = username.trim().toLowerCase() === ADMIN_USERNAME && (await sha256(password)) === ADMIN_PASSWORD_SHA256;

  if (ok) {
    window.localStorage.removeItem(LOCK_KEY);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: ADMIN_USERNAME, expires: Date.now() + SESSION_HOURS * 3600e3 }));
    return { ok: true };
  }

  const l = readJSON(window.localStorage, LOCK_KEY) || { attempts: 0 };
  const attempts = (l.attempts || 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    window.localStorage.setItem(LOCK_KEY, JSON.stringify({ attempts: 0, until: Date.now() + LOCK_SECONDS * 1000 }));
    return { ok: false, error: `Too many attempts. Login locked for ${LOCK_SECONDS} seconds.` };
  }
  window.localStorage.setItem(LOCK_KEY, JSON.stringify({ attempts }));
  return { ok: false, error: `Incorrect username or password. ${MAX_ATTEMPTS - attempts} attempts left.` };
}

export function logout() {
  window.sessionStorage.removeItem(SESSION_KEY);
}
