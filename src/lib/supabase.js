/**
 * Connection to the TimeTag database (Supabase), using plain web requests — no extra library.
 *
 * Supabase gives every project three web addresses we use here:
 *   /rest/v1     read and change tables (watches, collections, settings, orders)
 *   /auth/v1     admin sign-in
 *   /storage/v1  upload watch photos and collection logos
 *
 * The publishable key below is meant to be public (it's in every visitor's browser anyway).
 * What protects the data are the security rules in supabase/setup.sql.
 * Never put a "secret" or "service_role" key in this file.
 */
export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://sigkzebgvfupvltksgly.supabase.co';
export const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_KEY || 'sb_publishable_E46jH3feMlRU8bisrJufig_hAF7Kz6S';

const SESSION_KEY = 'timetag:admin-auth';
const OFFLINE = 'Can’t reach the TimeTag database. Check your internet connection and try again.';

/* ---------------- signed-in admin session ---------------- */
// { access_token, refresh_token, expires_at (seconds), user: { id, email } }
let session = readSession();
const sessionListeners = new Set();

function readSession() {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}
function saveSession(next) {
  session = next;
  try {
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: keep it in memory */
  }
  sessionListeners.forEach((l) => l(next));
}

/** Turns any Supabase error reply into one readable sentence. */
function errorMessage(data, status) {
  const msg = data && (data.message || data.error_description || data.msg || data.error);
  if (msg) return String(msg).replace(/^ERROR:\s*/, '');
  if (status === 401 || status === 403) return 'You don’t have permission to do that. Try signing in again.';
  return `Something went wrong (error ${status}). Please try again.`;
}

async function call(path, { method = 'GET', body, headers = {}, signedIn = true, raw = false, asToken } = {}) {
  if (signedIn && !asToken) await refreshIfNeeded();
  const token = asToken || (signedIn && session?.access_token);
  let res;
  try {
    res = await fetch(SUPABASE_URL + path, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!raw && body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: raw ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(OFFLINE);
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    // an expired sign-in: forget it so the admin is asked to sign in again
    if (res.status === 401 && token && !asToken) saveSession(null);
    const err = new Error(errorMessage(data, res.status));
    err.status = res.status;
    err.code = data && (data.error_code || data.code);
    throw err;
  }
  return data;
}

/* ---------------- tables (/rest/v1) ---------------- */
const enc = encodeURIComponent;
const where = (match) => Object.entries(match).map(([k, v]) => `${k}=eq.${enc(v)}`).join('&');

export const db = {
  /** Rows of a table. `query` is Supabase's URL syntax, e.g. 'order=created_at.desc'. */
  select: (table, query = '') => call(`/rest/v1/${table}?select=*${query ? `&${query}` : ''}`),

  /** Adds a row and returns it. */
  insert: async (table, row) =>
    (await call(`/rest/v1/${table}`, { method: 'POST', body: row, headers: { Prefer: 'return=representation' } }))[0],

  /** Adds or replaces a row (matched by `key`) and returns it. */
  upsert: async (table, row, key) =>
    (await call(`/rest/v1/${table}?on_conflict=${key}`, {
      method: 'POST',
      body: row,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    }))[0],

  /** Changes the rows matching `match` (e.g. { id: 'rolex' }) and returns the first one. */
  update: async (table, match, patch) => {
    const rows = await call(`/rest/v1/${table}?${where(match)}`, {
      method: 'PATCH',
      body: patch,
      headers: { Prefer: 'return=representation' },
    });
    // the security rules silently skip rows you may not change, so "nothing changed" = not allowed
    if (!rows?.length) throw new Error('That change wasn’t saved. You may need to sign in again as an admin.');
    return rows[0];
  },

  /** Deletes the rows matching `match`. */
  remove: async (table, match) => {
    const rows = await call(`/rest/v1/${table}?${where(match)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });
    if (!rows?.length) throw new Error('That wasn’t deleted. You may need to sign in again as an admin.');
  },

  /** Runs a database function (see section 7 of supabase/setup.sql). */
  rpc: (fn, args = {}, { asToken } = {}) => call(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args, asToken }),
};

/* ---------------- admin sign-in (/auth/v1) ---------------- */
function toSession(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    user: { id: data.user?.id, email: data.user?.email },
  };
}

let refreshing = null;
async function refreshIfNeeded() {
  if (!session) return;
  if (session.expires_at - 60 > Date.now() / 1000) return; // still valid for over a minute
  // if several requests need a refresh at once, they all wait for the same one
  if (!refreshing) {
    refreshing = call('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: session.refresh_token },
      signedIn: false,
    })
      .then((data) => saveSession(toSession(data)))
      .catch(() => saveSession(null)) // couldn't refresh: sign in again
      .finally(() => (refreshing = null));
  }
  await refreshing;
}

export const auth = {
  /**
   * Signs in with email + password. Throws a readable error if it fails.
   * `allowed(token)`: an extra check run before the sign-in is kept (e.g. "is this an admin?").
   * If it returns false, the sign-in is thrown away and an error with code 'not_allowed' is thrown.
   */
  async signIn(email, password, { allowed } = {}) {
    try {
      const data = await call('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email, password },
        signedIn: false,
      });
      const next = toSession(data);
      if (allowed && !(await allowed(next.access_token))) {
        fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${next.access_token}` },
        }).catch(() => {});
        throw Object.assign(new Error('This account isn’t allowed here.'), { code: 'not_allowed' });
      }
      saveSession(next);
      return session;
    } catch (e) {
      if (e.code === 'not_allowed') throw e;
      if (e.code === 'email_not_confirmed') {
        throw new Error('This email isn’t confirmed yet. In Supabase → Authentication → Users, confirm the user (or create it with “Auto Confirm User” ticked).');
      }
      if (e.status === 400) throw new Error('Incorrect email or password.');
      throw e;
    }
  },

  async signOut() {
    const token = session?.access_token;
    saveSession(null);
    if (token) {
      // tell Supabase too (if this fails, the sign-in still expires by itself)
      fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  },

  /** The current sign-in, or null. */
  session: () => session,

  /** Calls `listener(session)` whenever someone signs in or out. Returns a function to stop. */
  onChange(listener) {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
  },
};

// keep several open tabs in sync (sign out in one tab = signed out in all)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY) {
      session = readSession();
      sessionListeners.forEach((l) => l(session));
    }
  });
}

/* ---------------- images (/storage/v1) ---------------- */
export const BUCKET = 'images';
const PUBLIC_PREFIX = () => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export const storage = {
  /** Uploads a file and returns its public web address. */
  async upload(path, blob) {
    await call(`/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      body: blob,
      raw: true,
      headers: { 'Content-Type': blob.type || 'application/octet-stream' },
    });
    return PUBLIC_PREFIX() + path;
  },

  /** Deletes files by their public web addresses. Files that aren't in our storage are ignored. */
  async removeByUrl(urls) {
    const paths = urls.filter((u) => typeof u === 'string' && u.startsWith(PUBLIC_PREFIX())).map((u) => u.slice(PUBLIC_PREFIX().length));
    if (!paths.length) return;
    await call(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', body: { prefixes: paths } });
  },
};
