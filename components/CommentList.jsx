'use client';
// CommentList.jsx — comments under a post plus a box to add one.
import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { timeAgo } from '@/lib/time.js';

export default function CommentList({ comments, onAdd }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function add() {
    if (!text.trim()) return;
    setBusy(true);
    try { await onAdd(text.trim()); setText(''); } finally { setBusy(false); }
  }
  return (
    <div className="comments">
      <div className="comment-add">
        <input className="pill-input" placeholder="Add a comment…" value={text}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        <button className="link-btn" onClick={add} disabled={busy}>Comment</button>
      </div>
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <Avatar seed={c.author_name} size={32} />
          <div className="comment-body">
            <div className="comment-head"><span className="comment-author">{c.author_name}</span>
              <span className="dot">·</span><span className="muted">{timeAgo(c.created_at)}</span></div>
            <p className="comment-text">{c.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
