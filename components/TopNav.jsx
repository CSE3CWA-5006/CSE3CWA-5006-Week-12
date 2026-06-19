'use client';
// TopNav.jsx — the LinkedIn-style top bar: brand, search, and the main sections
// (Home, My Network, Messaging, Notifications, Me). "Me" opens a small menu with
// "View profile" and "Log out".
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Avatar from './Avatar.jsx';
import { api } from '@/lib/client.js';

function Icon({ d }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const ICONS = {
  home: <Icon d={<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>} />,
  network: <Icon d={<><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><path d="M15 20c0-2 1-3 3-3" /></>} />,
  messaging: <Icon d={<path d="M4 5h16v11H8l-4 4V5z" />} />,
  bell: <Icon d={<><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 21h4" /></>} />,
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);

  useEffect(() => { api.profile().then(setMe).catch(() => {}); }, []);

  function submitSearch(e) {
    e.preventDefault();
    if (q.trim()) router.push('/search?q=' + encodeURIComponent(q.trim()));
  }
  const link = (href, icon, label) => (
    <Link href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
      {icon}<span>{label}</span>
    </Link>
  );

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="CareerLoop home">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="9.5" cy="13" r="6.5" fill="none" stroke="var(--brand)" strokeWidth="3" />
            <circle cx="16.5" cy="13" r="6.5" fill="none" stroke="var(--accent)" strokeWidth="3" />
          </svg>
          <span className="brand-name">CareerLoop</span>
        </Link>

        <form className="search" onSubmit={submitSearch}>
          <span className="search-wrap">
            <input type="text" placeholder="Search people and posts" aria-label="Search people and posts"
              value={q} onChange={(e) => setQ(e.target.value)} />
            {q && (
              <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQ('')}>×</button>
            )}
          </span>
        </form>

        <nav className="nav">
          {link('/', ICONS.home, 'Home')}
          {link('/network', ICONS.network, 'My Network')}
          {link('/messaging', ICONS.messaging, 'Messaging')}
          {link('/notifications', ICONS.bell, 'Notifications')}
          <div className="nav-me">
            <button className={`nav-item ${menu ? 'active' : ''}`} onClick={() => setMenu((v) => !v)} aria-haspopup="true" aria-expanded={menu}>
              {me ? <Avatar seed={me.name} size={24} /> : <span className="nav-dot" />}
              <span>Me ▾</span>
            </button>
            {menu && (
              <div className="me-menu" onMouseLeave={() => setMenu(false)}>
                <Link href="/profile" className="me-menu-item" onClick={() => setMenu(false)}>View profile</Link>
                <button className="me-menu-item" onClick={async () => { await api.resetDemo(); window.location.reload(); }}>Reset demo data</button>
                <button className="me-menu-item" onClick={() => signOut({ callbackUrl: '/login' })}>Log out</button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
