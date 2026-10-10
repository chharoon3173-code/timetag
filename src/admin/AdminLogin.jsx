import { useState } from 'react';
import { login } from '../lib/auth.js';
import { href } from '../lib/router.js';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    const res = await login(username, password);
    setBusy(false);
    if (res.ok) onSuccess();
    else {
      setError(res.error);
      setPassword('');
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={submit} noValidate>
        <div className="adm-login__brand">
          <span className="adm-mono adm-mono--lg"><img src="brand/lion.png" alt="" /></span>
          <h1>TimeTag Admin</h1>
          <p>Sign in to manage orders and inventory.</p>
        </div>
        <label className="adm-label" htmlFor="adm-user">Username</label>
        <input id="adm-user" className="adm-input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        <label className="adm-label" htmlFor="adm-pass">Password</label>
        <div className="adm-pass">
          <input id="adm-pass" className="adm-input" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
        </div>
        {error && <p className="adm-login__err" role="alert">{error}</p>}
        <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <a className="adm-login__back" href={href('/')}>← Back to store</a>
      </form>
    </div>
  );
}
