/**
 * Admin sign-in, through Supabase (email + password).
 *
 * Your admin account is created in the Supabase dashboard (Authentication → Users), and its email
 * must be in the `admins` table — see the end of supabase/setup.sql. Signing in with any other
 * account is refused, and the database's security rules block it anyway.
 */
import { useSyncExternalStore } from 'react';
import { auth, db } from './supabase.js';
import { loadCatalog, loadOrders } from './store.js';

export const isLoggedIn = () => !!auth.session();

/** The signed-in admin's session ({ user: { email } }) or null; updates when it changes. */
export function useAdminSession() {
  return useSyncExternalStore(auth.onChange, auth.session, auth.session);
}

export async function login(email, password) {
  const address = email.trim().toLowerCase();
  if (!address || !password) return { ok: false, error: 'Enter your email and password.' };
  try {
    // the sign-in is only kept if the database says this email is on the admins list
    await auth.signIn(address, password, {
      allowed: (token) => db.rpc('is_admin', {}, { asToken: token }),
    });
    await Promise.all([loadCatalog(), loadOrders()]); // now including hidden watches and orders
    return { ok: true };
  } catch (e) {
    if (e.code === 'not_allowed') {
      return {
        ok: false,
        error: 'This account isn’t a TimeTag admin yet. Add its email to the admins table in Supabase (see the end of supabase/setup.sql).',
      };
    }
    return { ok: false, error: e.message };
  }
}

export const logout = () => auth.signOut();
