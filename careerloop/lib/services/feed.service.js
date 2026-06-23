/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// feed.service.js — builds the feed: original posts + reposts, newest first.
import { db } from '../db/database.js';

function countsFor(postId) {
  const reactions = db.prepare('SELECT COUNT(*) AS c FROM reactions WHERE post_id = ?').get(postId).c;
  const comments  = db.prepare('SELECT COUNT(*) AS c FROM comments  WHERE post_id = ?').get(postId).c;
  const reposts   = db.prepare('SELECT COUNT(*) AS c FROM reposts   WHERE post_id = ?').get(postId).c;
  return { reactions, comments, reposts };
}

function postWithAuthor(postId) {
  return db.prepare(`
    SELECT p.id, p.content, p.topic, p.visibility, p.created_at,
           u.id AS author_id, u.name AS author_name, u.role AS author_role,
           u.avatar_initials AS author_initials
    FROM posts p JOIN users u ON u.id = p.author_id
    WHERE p.id = ?`).get(postId);
}

export function getFeed() {
  const original = db.prepare('SELECT id FROM posts').all().map((row) => {
    const post = postWithAuthor(row.id);
    return { type: 'post', feed_time: post.created_at, post, counts: countsFor(post.id), repost: null };
  });
  const shared = db.prepare(`
    SELECT r.post_id, r.note, r.created_at, u.name AS by_name, u.avatar_initials AS by_initials
    FROM reposts r JOIN users u ON u.id = r.user_id`).all().map((r) => {
    const post = postWithAuthor(r.post_id);
    return {
      type: 'repost', feed_time: r.created_at, post, counts: countsFor(post.id),
      repost: { by_name: r.by_name, by_initials: r.by_initials, note: r.note },
    };
  });
  return [...original, ...shared].sort((a, b) => b.feed_time.localeCompare(a.feed_time));
}
