// notifications.service.js — built on the fly from activity on MY posts and connections.
// This is a good example of turning several tables into one tidy list.
import { db } from '../db/database.js';

export function getNotifications(meId) {
  const items = [];

  // Reactions on my posts
  for (const r of db.prepare(`
    SELECT u.name AS actor, u.avatar_initials AS initials, re.type, re.created_at, p.id AS post_id
    FROM reactions re
    JOIN posts p ON p.id = re.post_id
    JOIN users u ON u.id = re.user_id
    WHERE p.author_id = ? AND re.user_id != ?`).all(meId, meId)) {
    items.push({ kind: 'reaction', actor: r.actor, initials: r.initials,
      text: `reacted (${r.type}) to your post`, created_at: r.created_at, post_id: r.post_id });
  }

  // Comments on my posts
  for (const c of db.prepare(`
    SELECT u.name AS actor, u.avatar_initials AS initials, c.created_at, p.id AS post_id
    FROM comments c
    JOIN posts p ON p.id = c.post_id
    JOIN users u ON u.id = c.user_id
    WHERE p.author_id = ? AND c.user_id != ?`).all(meId, meId)) {
    items.push({ kind: 'comment', actor: c.actor, initials: c.initials,
      text: 'commented on your post', created_at: c.created_at, post_id: c.post_id });
  }

  // Pending invitations sent to me ("X wants to connect")
  for (const k of db.prepare(`
    SELECT u.name AS actor, u.avatar_initials AS initials, cn.created_at, cn.message
    FROM connections cn
    JOIN users u ON u.id = cn.requester_id
    WHERE cn.addressee_id = ? AND cn.status = 'pending'`).all(meId)) {
    items.push({ kind: 'invitation', actor: k.actor, initials: k.initials,
      text: `wants to connect${k.message ? `: “${k.message}”` : ''}`, created_at: k.created_at, post_id: null });
  }

  // Accepted connections involving me
  for (const k of db.prepare(`
    SELECT u.name AS actor, u.avatar_initials AS initials, cn.created_at
    FROM connections cn
    JOIN users u ON u.id = CASE WHEN cn.requester_id = ? THEN cn.addressee_id ELSE cn.requester_id END
    WHERE (cn.requester_id = ? OR cn.addressee_id = ?) AND cn.status = 'accepted'`).all(meId, meId, meId)) {
    items.push({ kind: 'connection', actor: k.actor, initials: k.initials,
      text: 'is now connected with you', created_at: k.created_at, post_id: null });
  }

  return items.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 25);
}
