'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Search results — people and posts that match the query in the top bar.
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Avatar from '@/components/Avatar.jsx';
import { timeAgo } from '@/lib/time.js';
import { api } from '@/lib/client.js';

function SearchInner() {
  const q = useSearchParams().get('q') || '';
  const [res, setRes] = useState({ users: [], posts: [] });
  useEffect(() => { if (q) api.search(q).then(setRes); }, [q]);
  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">Results for “{q}”</h1>
      <div className="card">
        <h3 className="card-title">People</h3>
        {res.users.length === 0 && <p className="muted">No people found.</p>}
        {res.users.map((u) => (
          <div key={u.id} className="notif"><Avatar seed={u.name} size={40} />
            <div><Link className="person-name" href={`/profile/${u.id}`}>{u.name}</Link><br /><span className="muted">{u.role}</span></div></div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">Posts</h3>
        {res.posts.length === 0 && <p className="muted">No posts found.</p>}
        {res.posts.map((p) => (
          <div key={p.id} className="notif"><Avatar seed={p.author_name} size={40} />
            <div><strong>{p.author_name}</strong> · <span className="muted">{timeAgo(p.created_at)}</span><br />{p.content}</div></div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="container">Searching…</div>}><SearchInner /></Suspense>;
}
