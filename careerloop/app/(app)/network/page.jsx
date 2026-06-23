'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// My Network — invitations to accept/decline, your connections, requests you have
// sent, and suggestions you can Connect with (each Connect sends a short message).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar.jsx';
import { api } from '@/lib/client.js';

export default function NetworkPage() {
  const [data, setData] = useState({ connections: [], invitations: [], sent: [], suggestions: [] });
  const [composing, setComposing] = useState(null);                 // user id we are messaging
  const [message, setMessage] = useState("Hi, I'd love to connect.");
  const load = async () => setData(await api.network());
  useEffect(() => { load(); }, []);

  async function sendRequest(id) { await api.requestConnect(id, message); setComposing(null); setMessage("Hi, I'd love to connect."); await load(); }
  async function respond(reqId, accept) { await api.respondInvitation(reqId, accept); await load(); }
  async function remove(id) { await api.disconnect(id); await load(); }

  const Person = (u, footer) => (
    <div className="card person-card" key={u.id}>
      <Avatar seed={u.name} size={64} />
      <Link href={`/profile/${u.id}`} className="person-name">{u.name}</Link>
      <span className="person-role">{u.role}</span>
      {footer}
    </div>
  );

  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">My Network</h1>

      {data.invitations.length > 0 && (
        <>
          <h2 className="section-title">Invitations ({data.invitations.length})</h2>
          {data.invitations.map((u) => (
            <div className="card invite-card" key={u.id}>
              <Avatar seed={u.name} size={48} />
              <div className="invite-body">
                <Link href={`/profile/${u.id}`} className="person-name">{u.name}</Link>
                <span className="person-role">{u.role}</span>
                {u.message && <p className="invite-msg">“{u.message}”</p>}
              </div>
              <div className="invite-actions">
                <button className="primary-btn" onClick={() => respond(u.request_id, true)}>Accept</button>
                <button className="ghost-btn" onClick={() => respond(u.request_id, false)}>Decline</button>
              </div>
            </div>
          ))}
        </>
      )}

      <h2 className="section-title">Your connections ({data.connections.length})</h2>
      <div className="people-grid">
        {data.connections.length === 0 && <p className="muted">No connections yet.</p>}
        {data.connections.map((u) => Person(u, (
          <div className="person-actions">
            <Link className="ghost-btn" href={`/messaging?to=${u.id}`}>Message</Link>
            <button className="ghost-btn" onClick={() => remove(u.id)}>Remove</button>
          </div>
        )))}
      </div>

      {data.sent.length > 0 && (
        <>
          <h2 className="section-title">Requests sent ({data.sent.length})</h2>
          <div className="people-grid">
            {data.sent.map((u) => Person(u, (
              <div className="person-actions">
                <span className="pending-tag">Pending</span>
                <button className="ghost-btn" onClick={() => remove(u.id)}>Cancel</button>
              </div>
            )))}
          </div>
        </>
      )}

      <h2 className="section-title">People you may know</h2>
      <div className="people-grid">
        {data.suggestions.map((u) => Person(u, (
          composing === u.id ? (
            <div className="connect-box">
              <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a short note…" />
              <div className="person-actions">
                <button className="primary-btn" onClick={() => sendRequest(u.id)}>Send request</button>
                <button className="ghost-btn" onClick={() => setComposing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="person-actions">
              <button className="primary-btn" onClick={() => setComposing(u.id)}>Connect</button>
            </div>
          )
        )))}
      </div>
    </div>
  );
}
