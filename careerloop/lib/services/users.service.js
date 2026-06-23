/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// users.service.js — accounts, login, profile editing and search.
import { db } from '../db/database.js';

// Remove the password before sending a user to the browser.
function publicUser(u) {
  if (!u) return null;
  const { password, ...safe } = u;
  safe.skills = (safe.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  return safe;
}

export function getUserById(id) {
  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

// Used by the password login (Auth.js Credentials provider).
export function loginWithPassword(username, password) {
  const u = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  return publicUser(u);
}

// Used by the OAuth login (GitHub / Google / Microsoft).
// If we have seen this account before we reuse it; otherwise we create a new user
// from the basic info the provider gives us (their name).
export function upsertOAuthUser({ provider, providerId, name, email }) {
  const username = `${provider}_${providerId}`.toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return existing.id;

  const safeName = name || 'New Member';
  const initials = safeName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'NM';
  const info = db.prepare(`
    INSERT INTO users (name, username, password, role, location, avatar_initials, about, skills, connections, profile_completion, is_me)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 40, 0)`
  ).run(safeName, username, 'oauth-no-password', 'CareerLoop Member', '', initials,
        `Joined CareerLoop via ${provider}.`, '');
  return Number(info.lastInsertRowid);
}

export function listUsers() {
  return db.prepare('SELECT * FROM users ORDER BY name').all().map(publicUser);
}

export function updateProfile(userId, fields) {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!current) return null;
  const next = {
    name: fields.name ?? current.name,
    role: fields.role ?? current.role,
    location: fields.location ?? current.location,
    university: fields.university ?? current.university,
    about: fields.about ?? current.about,
    skills: Array.isArray(fields.skills) ? fields.skills.join(', ') : (fields.skills ?? current.skills),
  };
  db.prepare('UPDATE users SET name = ?, role = ?, location = ?, university = ?, about = ?, skills = ? WHERE id = ?')
    .run(next.name, next.role, next.location, next.university, next.about, next.skills, userId);
  return getUserById(userId);
}

// Search users (by name/role/username) and posts (by content). Limited results.
export function search(q) {
  const like = `%${q}%`;
  const users = db.prepare(`
    SELECT * FROM users WHERE name LIKE ? OR role LIKE ? OR username LIKE ? LIMIT 8`
  ).all(like, like, like).map(publicUser);
  const posts = db.prepare(`
    SELECT p.id, p.content, p.topic, p.created_at, u.name AS author_name, u.avatar_initials AS author_initials
    FROM posts p JOIN users u ON u.id = p.author_id
    WHERE p.content LIKE ? ORDER BY p.created_at DESC LIMIT 10`).all(like);
  return { users, posts };
}
