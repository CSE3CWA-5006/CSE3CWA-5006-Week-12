'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Another user's profile. The buttons depend on our relationship:
//   none -> Connect (with a short message)   pending_sent -> Pending (cancel)
//   pending_received -> Accept / Decline      connected -> Message / Remove
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar.jsx';
import { api } from '@/lib/client.js';

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [u, setU] = useState(null);
  const [missing, setMissing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState("Hi, I'd love to connect.");

  const load = async () => {
    try {
      const data = await api.user(id);
      if (data.is_me) { router.replace('/profile'); return; }
      setU(data);
    } catch { setMissing(true); }
  };
  useEffect(() => { load(); }, [id]);
  if (missing) return <div className="container"><Link href="/" className="back-link">← Back to feed</Link><p className="muted">User not found.</p></div>;
  if (!u) return <div className="container"><p className="muted">Loading…</p></div>;

  async function sendRequest() { await api.requestConnect(u.id, message); setComposing(false); await load(); }
  async function respond(accept) { await api.respondInvitation(u.request_id, accept); await load(); }
  async function remove() { await api.disconnect(u.id); await load(); }

  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">Profile</h1>
      <div className="card">
        <div className="profile-detail-banner" />
        <div className="profile-detail-top">
          <Avatar seed={u.name} size={84} />
          <div><h2 className="profile-detail-name">{u.name}</h2><p className="muted">{u.role} · {u.location}</p>{u.university && <p className="profile-uni">🎓 {u.university}</p>}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {u.rel === 'connected' && (<>
              <Link className="ghost-btn" href={`/messaging?to=${u.id}`}>Message</Link>
              <button className="ghost-btn" onClick={remove}>Remove</button>
            </>)}
            {u.rel === 'pending_sent' && (<>
              <span className="pending-tag">Request pending</span>
              <button className="ghost-btn" onClick={remove}>Cancel</button>
            </>)}
            {u.rel === 'pending_received' && (<>
              <button className="primary-btn" onClick={() => respond(true)}>Accept</button>
              <button className="ghost-btn" onClick={() => respond(false)}>Decline</button>
            </>)}
            {u.rel === 'none' && !composing && (
              <button className="primary-btn" onClick={() => setComposing(true)}>Connect</button>
            )}
          </div>
        </div>

        {u.rel === 'pending_received' && u.message && (
          <p className="invite-msg" style={{ marginTop: 12 }}>“{u.message}”</p>
        )}
        {u.rel === 'none' && composing && (
          <div className="connect-box" style={{ marginTop: 12 }}>
            <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a short note…" />
            <div className="person-actions">
              <button className="primary-btn" onClick={sendRequest}>Send request</button>
              <button className="ghost-btn" onClick={() => setComposing(false)}>Cancel</button>
            </div>
          </div>
        )}

        <p className="profile-about">{u.about}</p>
        <h3 className="card-title">Skills</h3>
        <ul className="chips">{u.skills.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
      </div>
    </div>
  );
}
