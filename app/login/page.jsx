'use client';
// login/page.jsx — sign in with a password OR with a REAL GitHub/Google/Microsoft
// redirect. The OAuth buttons always start the real provider flow; once you add the
// provider keys to .env.local (and approve the app on the provider side), the login
// completes and a CareerLoop account is created automatically on first sign-in.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Listed in the hover "Help" panel so every demo login is visible.
const DEMO_ACCOUNTS = [
  'Alex Chen', 'Emily Carter', 'Daniel Walker', 'Mei Lin', 'Tom Becker',
  'Grace Mitchell', 'Lucas Bennett', 'Hannah Wright', 'Noah Taylor', 'Wei Zhang',
].map((name) => {
  const username = name.toLowerCase().replace(/\s+/g, '');
  return { name, username, password: `${username}1234` };
});

const OAUTH = [
  { id: 'github', label: 'GitHub' },
  { id: 'google', label: 'Google' },
  { id: 'microsoft-entra-id', label: 'Microsoft' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('alexchen');
  const [password, setPassword] = useState('alexchen1234');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function passwordLogin(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const res = await signIn('credentials', { username, password, redirect: false });
    setBusy(false);
    if (res?.error) setError('Wrong username or password. Try alexchen / alexchen1234.');
    else router.push('/');
  }

  // Reliable, no-setup entry. Signs in as a shared guest account and goes to the feed.
  async function guestLogin() {
    setBusy(true); setError('');
    await signIn('guest', { redirect: false });
    router.push('/');
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="login-brand">
          <svg width="30" height="30" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="9.5" cy="13" r="6.5" fill="none" stroke="var(--brand)" strokeWidth="3" />
            <circle cx="16.5" cy="13" r="6.5" fill="none" stroke="var(--accent)" strokeWidth="3" />
          </svg>
          <span className="brand-name">CareerLoop</span>
        </div>
        <p className="login-sub">Sign in to your professional feed</p>

        <form onSubmit={passwordLogin}>
          <div className="field">
            <label htmlFor="u">Username</label>
            <input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <p className="hint">
              Demo account: <strong>alexchen</strong> / <strong>alexchen1234</strong>.{' '}
              {/* All elements below are spans so nothing block-level lives inside this <p>. */}
              <span className="help" tabIndex={0}>
                <span className="help-trigger">Help — all logins ▾</span>
                <span className="help-pop" role="tooltip">
                  <span className="help-title">Demo accounts (password = username + 1234)</span>
                  <span className="help-rows">
                    <span className="help-row help-head"><span>Name</span><span>Username</span><span>Password</span></span>
                    {DEMO_ACCOUNTS.map((a) => (
                      <span className="help-row" key={a.username}><span>{a.name}</span><span>{a.username}</span><span>{a.password}</span></span>
                    ))}
                  </span>
                </span>
              </span>
            </p>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <div className="divider">or continue with</div>
        {OAUTH.map((o) => (
          <button key={o.id} className="oauth-btn" onClick={() => signIn(o.id, { callbackUrl: '/' })}>
            Continue with {o.label}
          </button>
        ))}
        <button className="oauth-btn guest-btn" onClick={guestLogin} disabled={busy}>
          Continue as guest (no setup)
        </button>
        <p className="hint" style={{ textAlign: 'center', marginTop: 4 }}>
          GitHub/Google/Microsoft need provider keys in <strong>.env.local</strong>. If one
          isn't set up yet, use <strong>Continue as guest</strong> to get straight in.
        </p>
      </div>
      <p className="footer">Copyright © 2026 Shuo Ding</p>
    </div>
  );
}
