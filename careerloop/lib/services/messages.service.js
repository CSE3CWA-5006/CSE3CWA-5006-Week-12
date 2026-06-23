/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// messages.service.js — private messages for the Messaging page.
import { db } from '../db/database.js';

// A list of the people I have a conversation with, plus the latest message.
export function getThreads(meId) {
  const partners = db.prepare(`
    SELECT DISTINCT CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS other_id
    FROM messages WHERE sender_id = ? OR recipient_id = ?`).all(meId, meId, meId);

  return partners.map(({ other_id }) => {
    const other = db.prepare('SELECT id, name, avatar_initials, role FROM users WHERE id = ?').get(other_id);
    const last = db.prepare(`
      SELECT body, created_at FROM messages
      WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
      ORDER BY id DESC LIMIT 1`).get(meId, other_id, other_id, meId);
    return { other, last };
  }).sort((a, b) => (b.last?.created_at || '').localeCompare(a.last?.created_at || ''));
}

// The full conversation between me and one other user.
export function getThread(meId, otherId) {
  const other = db.prepare('SELECT id, name, avatar_initials, role FROM users WHERE id = ?').get(otherId);
  const messages = db.prepare(`
    SELECT id, sender_id, recipient_id, body, created_at FROM messages
    WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
    ORDER BY id`).all(meId, otherId, otherId, meId);
  return { other, messages };
}

export function sendMessage(meId, otherId, body) {
  db.prepare('INSERT INTO messages (sender_id, recipient_id, body, created_at) VALUES (?, ?, ?, ?)')
    .run(meId, otherId, body, new Date().toISOString());
  return getThread(meId, otherId);
}
