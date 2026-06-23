'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// My profile — View, then Edit, then Save (or Cancel). The "← Back to feed" link
// closes the page at any time.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/Avatar.jsx';
import { api } from '@/lib/client.js';

export default function ProfilePage() {
  const [me, setMe] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.profile().then(setMe); }, []);
  function startEdit() {
    setForm({ name: me.name, role: me.role, location: me.location, university: me.university, about: me.about, skills: (me.skills || []).join(', ') });
    setEditing(true); setSaved(false);
  }
  async function save() {
    const updated = await api.updateProfile({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) });
    setMe(updated); setEditing(false); setSaved(true);
  }
  if (!me) return <div className="container"><p className="muted">Loading…</p></div>;

  return (
    <div className="container">
      <Link href="/" className="back-link">← Back to feed</Link>
      <h1 className="page-title">Profile</h1>
      <div className="card">
        <div className="profile-detail-banner" />
        <div className="profile-detail-top">
          <Avatar seed={me.name} size={84} />
          <div><h2 className="profile-detail-name">{me.name}</h2><p className="muted">{me.role} · {me.location}</p>{me.university && <p className="profile-uni">🎓 {me.university}</p>}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button className="primary-btn" onClick={save}>Save</button>
                <button className="ghost-btn" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="ghost-btn" onClick={startEdit}>Edit profile</button>
            )}
          </div>
        </div>

        {saved && !editing && <p className="saved-note">✓ Profile saved.</p>}

        {!editing ? (
          <>
            <p className="profile-about">{me.about}</p>
            <h3 className="card-title">Skills</h3>
            <ul className="chips">{me.skills.map((s) => <li key={s} className="chip">{s}</li>)}</ul>
          </>
        ) : (
          <div style={{ marginTop: 16 }}>
            {['name', 'role', 'location', 'university'].map((f) => (
              <div className="form-row" key={f}><label>{f[0].toUpperCase() + f.slice(1)}</label>
                <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} /></div>
            ))}
            <div className="form-row"><label>About</label>
              <textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
            <div className="form-row"><label>Skills (comma-separated)</label>
              <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
