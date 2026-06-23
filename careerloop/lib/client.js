/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// client.js — the ONLY place the browser talks to the API.
// The Auth.js session cookie is sent automatically, so the server knows who we are.
async function req(path, options = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  profile:       () => req('/api/profile'),
  updateProfile: (d) => req('/api/profile', { method: 'PUT', body: JSON.stringify(d) }),
  user:    (id) => req(`/api/users/${id}`),
  topics:  () => req('/api/topics'),
  feed:    () => req('/api/feed'),
  bootstrap: () => req('/api/bootstrap'),
  comments:(id) => req(`/api/posts/${id}/comments`),
  createPost: (d) => req('/api/posts', { method: 'POST', body: JSON.stringify(d) }),
  addComment: (id, content) => req(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  react:   (id, type = 'like') => req(`/api/posts/${id}/react`, { method: 'POST', body: JSON.stringify({ type }) }),
  repost:  (id, note) => req(`/api/posts/${id}/repost`, { method: 'POST', body: JSON.stringify({ note }) }),
  network: () => req('/api/network'),
  requestConnect: (id, message) => req(`/api/connections/${id}`, { method: 'POST', body: JSON.stringify({ message }) }),
  respondInvitation: (id, accept) => req(`/api/invitations/${id}`, { method: 'POST', body: JSON.stringify({ accept }) }),
  disconnect: (id) => req(`/api/connections/${id}`, { method: 'DELETE' }),
  threads: () => req('/api/messages'),
  thread:  (id) => req(`/api/messages/${id}`),
  sendMessage: (id, body) => req(`/api/messages/${id}`, { method: 'POST', body: JSON.stringify({ body }) }),
  notifications: () => req('/api/notifications'),
  stats: () => req('/api/stats'),
  search:  (q) => req('/api/search?q=' + encodeURIComponent(q)),
  resetDemo: () => req('/api/reset-demo-data', { method: 'POST' }),
};
