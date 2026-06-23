/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// posts.service.js — writes (create post, comment, react, repost) as a given user.
// Every function takes userId, so the API layer passes in the logged-in user.
import { db } from '../db/database.js';

const nowISO = () => new Date().toISOString();

export function postExists(postId) {
  return !!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(postId);
}

export function createPost(userId, { content, topic, visibility }) {
  const info = db.prepare(
    'INSERT INTO posts (author_id, content, topic, visibility, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, content, topic || null, visibility || 'Public', nowISO());
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(info.lastInsertRowid));
}

export function getComments(postId) {
  return db.prepare(`
    SELECT c.id, c.content, c.created_at, u.name AS author_name, u.avatar_initials AS author_initials
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ? ORDER BY c.id`).all(postId);
}

export function addComment(postId, userId, content) {
  const info = db.prepare(
    'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(postId, userId, content, nowISO());
  return db.prepare('SELECT * FROM comments WHERE id = ?').get(Number(info.lastInsertRowid));
}

export function addReaction(postId, userId, type) {
  db.prepare('INSERT INTO reactions (post_id, user_id, type, created_at) VALUES (?, ?, ?, ?)')
    .run(postId, userId, type || 'like', nowISO());
  return db.prepare('SELECT COUNT(*) AS c FROM reactions WHERE post_id = ?').get(postId).c;
}

export function addRepost(postId, userId, note) {
  db.prepare('INSERT INTO reposts (post_id, user_id, note, created_at) VALUES (?, ?, ?, ?)')
    .run(postId, userId, note || null, nowISO());
  return db.prepare('SELECT COUNT(*) AS c FROM reposts WHERE post_id = ?').get(postId).c;
}
