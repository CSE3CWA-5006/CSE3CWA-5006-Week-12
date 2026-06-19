'use client';
// PostComposer.jsx — write and publish a new post.
import { useState } from 'react';
import Avatar from './Avatar.jsx';

export default function PostComposer({ profile, topics, onCreate }) {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (!content.trim()) { setError('Write something before posting.'); return; }
    setBusy(true); setError('');
    try { await onCreate({ content, topic: topic || null, visibility }); setContent(''); setTopic(''); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <div className="card composer">
      <div className="composer-top">
        <Avatar seed={profile?.name || '?'} size={44} />
        <textarea className="composer-input" rows={2} placeholder="Share an update with your network…"
          value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="composer-actions">
        <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Category">
          <option value="">Choose a field…</option>
          {topics.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} aria-label="Visibility">
          <option>Public</option><option>Connections</option><option>Private</option>
        </select>
        <button className="primary-btn" onClick={submit} disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
