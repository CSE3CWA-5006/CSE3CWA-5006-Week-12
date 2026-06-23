'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Notifications — activity on your posts and connections.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar.jsx';
import { timeAgo } from '@/lib/time.js';
import { api } from '@/lib/client.js';

export default function NotificationsPage() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.notifications().then(setItems); }, []);
  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">Notifications</h1>
      <div className="card">
        {items === null && <p className="muted">Loading…</p>}
        {items && items.length === 0 && <p className="muted">No notifications yet.</p>}
        {items && items.map((n, i) => (
          <div key={i} className="notif">
            <Avatar seed={n.actor} size={40} />
            <div className="notif-text"><strong>{n.actor}</strong> {n.text}<br />
              <span className="muted" style={{ fontSize: 12 }}>{timeAgo(n.created_at)}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
