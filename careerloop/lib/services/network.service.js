/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// network.service.js — connections with a request/accept flow.
//   Connect  -> creates a 'pending' invitation (with a short message).
//   The other person sees it and Accepts (-> 'accepted') or Declines (-> deleted).
//   Only 'accepted' links count as being in each other's network.
import { db } from '../db/database.js';

function pub(u) {
  const { password, ...safe } = u;
  safe.skills = (safe.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  return safe;
}

// The accepted-or-pending row between two users (either direction), if any.
function rowBetween(a, b) {
  return db.prepare(`
    SELECT * FROM connections
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`
  ).get(a, b, b, a);
}

export function isConnected(a, b) {
  const r = rowBetween(a, b);
  return !!r && r.status === 'accepted';
}

// Describe my relationship to one other user (used by their profile page).
export function getRelation(meId, otherId) {
  const r = rowBetween(meId, otherId);
  if (!r) return { rel: 'none' };
  if (r.status === 'accepted') return { rel: 'connected' };
  if (r.requester_id === meId) return { rel: 'pending_sent' };
  return { rel: 'pending_received', request_id: r.id, message: r.message };
}

// The four buckets shown on the My Network page.
export function getNetwork(meId) {
  const rows = db.prepare('SELECT * FROM connections WHERE requester_id = ? OR addressee_id = ?').all(meId, meId);
  const relBy = new Map();
  for (const r of rows) relBy.set(r.requester_id === meId ? r.addressee_id : r.requester_id, r);

  const connections = [], invitations = [], sent = [], suggestions = [];
  for (const u of db.prepare('SELECT * FROM users WHERE id != ?').all(meId)) {
    const safe = pub(u);
    const r = relBy.get(u.id);
    if (!r) suggestions.push(safe);
    else if (r.status === 'accepted') connections.push(safe);
    else if (r.requester_id === meId) sent.push({ ...safe, request_id: r.id });
    else invitations.push({ ...safe, request_id: r.id, message: r.message });
  }
  return { connections, invitations, sent, suggestions };
}

// Send a connection request with a short message.
export function requestConnect(meId, otherId, message) {
  if (meId === otherId || rowBetween(meId, otherId)) return;
  db.prepare('INSERT INTO connections (requester_id, addressee_id, status, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(meId, otherId, 'pending', (message || '').trim(), new Date().toISOString());
}

// Accept or decline an invitation. Only the addressee may respond.
export function respondInvitation(meId, requestId, accept) {
  const r = db.prepare('SELECT * FROM connections WHERE id = ?').get(requestId);
  if (!r || r.addressee_id !== meId || r.status !== 'pending') return false;
  if (accept) db.prepare("UPDATE connections SET status = 'accepted' WHERE id = ?").run(requestId);
  else db.prepare('DELETE FROM connections WHERE id = ?').run(requestId);
  return true;
}

// Remove a connection, or cancel a request I sent (deletes any row between us).
export function disconnect(meId, otherId) {
  db.prepare(`
    DELETE FROM connections
    WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`
  ).run(meId, otherId, otherId, meId);
}
