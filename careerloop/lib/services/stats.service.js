/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// stats.service.js — small, real numbers about the signed-in user, built from the
// database. Used by the two cards in the left sidebar.
import { db } from '../db/database.js';

export function getStats(meId) {
  const one = (sql, ...args) => db.prepare(sql).get(...args).c;

  const posts = one('SELECT COUNT(*) c FROM posts WHERE author_id = ?', meId);
  const reactions = one('SELECT COUNT(*) c FROM reactions re JOIN posts p ON p.id = re.post_id WHERE p.author_id = ?', meId);
  const comments  = one('SELECT COUNT(*) c FROM comments  c2 JOIN posts p ON p.id = c2.post_id WHERE p.author_id = ?', meId);
  const reposts   = one('SELECT COUNT(*) c FROM reposts   r  JOIN posts p ON p.id = r.post_id  WHERE p.author_id = ?', meId);
  // "Profile viewers" = distinct people who engaged with my posts (a real signal).
  const viewers = one(`
    SELECT COUNT(*) c FROM (
      SELECT user_id FROM reactions re JOIN posts p ON p.id = re.post_id WHERE p.author_id = ? AND user_id != ?
      UNION
      SELECT user_id FROM comments  c2 JOIN posts p ON p.id = c2.post_id WHERE p.author_id = ? AND user_id != ?
    )`, meId, meId, meId, meId);
  const connections = one(`SELECT COUNT(*) c FROM connections WHERE status='accepted' AND (requester_id=? OR addressee_id=?)`, meId, meId);
  const commentsMade = one('SELECT COUNT(*) c FROM comments WHERE user_id = ?', meId);

  return {
    profileViewers: viewers,
    postImpressions: reactions + comments + reposts, // total interactions on my posts
    posts,
    connections,
    commentsMade,
  };
}
