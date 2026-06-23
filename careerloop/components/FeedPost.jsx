'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// FeedPost.jsx — one feed item; handles its own Like / Comment / Repost UI.
import { useState } from 'react';
import Link from 'next/link';
import Avatar from './Avatar.jsx';
import CommentList from './CommentList.jsx';
import { timeAgo } from '@/lib/time.js';
import { api } from '@/lib/client.js';

export default function FeedPost({ item, onReact, onRepost, onComment }) {
  const { post, counts, type, repost } = item;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [showRepost, setShowRepost] = useState(false);
  const [note, setNote] = useState('');

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next) setComments(await api.comments(post.id));
  }
  async function addComment(text) { await onComment(post.id, text); setComments(await api.comments(post.id)); }
  async function confirmRepost() { await onRepost(post.id, note.trim()); setNote(''); setShowRepost(false); }

  return (
    <article className="card post">
      {type === 'repost' && (
        <div className="repost-banner">
          <span className="repost-icon">↻</span> <strong>{repost.by_name}</strong> reposted
          {repost.note && <p className="repost-note">{repost.note}</p>}
        </div>
      )}
      <header className="post-head">
        <Avatar seed={post.author_name} size={44} />
        <div className="post-author">
          <Link href={`/profile/${post.author_id}`} className="post-name">{post.author_name}</Link>
          <span className="post-role">{post.author_role}</span>
          <span className="muted post-time">{timeAgo(post.created_at)} · {post.visibility}</span>
        </div>
      </header>
      <p className="post-content">{post.content}</p>
      {post.topic && <span className="post-topic">#{post.topic}</span>}
      <div className="post-counts">
        <span>{counts.reactions} reactions</span><span>{counts.comments} comments</span><span>{counts.reposts} reposts</span>
      </div>
      <div className="post-actions">
        <button className="action-btn" onClick={() => onReact(post.id)}>👍 Like</button>
        <button className="action-btn" onClick={toggleComments}>💬 Comment</button>
        <button className="action-btn" onClick={() => setShowRepost((v) => !v)}>↻ Repost</button>
      </div>
      {showRepost && (
        <div className="repost-box">
          <input className="pill-input" placeholder="Add a note (optional)…" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="link-btn" onClick={confirmRepost}>Repost</button>
        </div>
      )}
      {showComments && <CommentList comments={comments} onAdd={addComment} />}
    </article>
  );
}
