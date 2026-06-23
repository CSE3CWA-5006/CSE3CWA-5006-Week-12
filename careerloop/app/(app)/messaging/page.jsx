'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// Messaging — an inbox on the left, and the open one-to-one conversation on the
// right (just the back-and-forth bubbles between you and that person).
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Avatar from '@/components/Avatar.jsx';
import { api } from '@/lib/client.js';

function MessagingInner() {
  const toParam = useSearchParams().get('to');
  const [me, setMe] = useState(null);
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');

  useEffect(() => {
    api.profile().then(setMe);
    api.threads().then((t) => {
      setThreads(t);
      const initial = toParam ? Number(toParam) : t[0]?.other.id;
      if (initial) open(initial);
    });
  }, []);

  async function open(id) { setActive(id); setThread(await api.thread(id)); }
  async function send() {
    if (!text.trim()) return;
    const updated = await api.sendMessage(active, text.trim());
    setText(''); setThread(updated); setThreads(await api.threads());
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">Messaging</h1>
      <div className="card">
        <div className="msg-layout">
          {/* Inbox: each person appears once */}
          <div className="thread-list">
            {threads.length === 0 && <p className="muted">No conversations yet.</p>}
            {threads.map((t) => (
              <button key={t.other.id} className={`thread-item ${active === t.other.id ? 'active' : ''}`} onClick={() => open(t.other.id)}>
                <Avatar seed={t.other.name} size={40} />
                <span className="thread-meta">
                  <span className="thread-name">{t.other.name}</span>
                  <span className="thread-last">{t.last?.body}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Open conversation: the name shows once as a title, then the bubbles */}
          <div className="thread-view">
            {thread && thread.other ? (
              <>
                <div className="thread-header">
                  <span className="thread-title">{thread.other.name}</span>
                  <span className="muted thread-sub">{thread.other.role}</span>
                </div>
                <div className="bubbles">
                  {thread.messages.length === 0 && <p className="muted">No messages yet.</p>}
                  {thread.messages.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender_id === me?.id ? 'me' : 'them'}`}>{m.body}</div>
                  ))}
                </div>
                <div className="msg-compose">
                  <input className="pill-input" placeholder="Write a message…" value={text}
                    onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
                  <button className="primary-btn" onClick={send}>Send</button>
                </div>
              </>
            ) : <p className="muted">Select a conversation to start.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagingPage() {
  return <Suspense fallback={<div className="container">Loading…</div>}><MessagingInner /></Suspense>;
}
