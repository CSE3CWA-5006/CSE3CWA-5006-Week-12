'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// ProfileSidebar.jsx — left column: snapshot, a star "profile level", and two cards
// of real numbers. Data comes in as props (loaded once by the Home page).
import Link from 'next/link';
import Avatar from './Avatar.jsx';

function Stars({ value }) {
  return (
    <span className="stars" aria-label={`Profile level ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= value ? 'star on' : 'star'}>★</span>)}
    </span>
  );
}

export default function ProfileSidebar({ profile, stats }) {
  if (!profile) return <div className="card">Loading profile…</div>;
  const level = Math.max(1, Math.round((profile.profile_completion || 0) / 20)); // 1..5
  const s = stats || {};

  return (
    <>
      <div className="card profile-card">
        <div className="profile-banner" />
        <div className="profile-top">
          <div className="profile-avatar"><Avatar seed={profile.name} size={72} /></div>
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-role">{profile.role}</p>
          <p className="profile-location">{profile.location}</p>
          {profile.university && <p className="profile-uni">🎓 {profile.university}</p>}
        </div>
        <div className="profile-level">
          <span className="muted">Profile level</span>
          <span className="level-right"><Stars value={level} /> <span className="muted">{level}/5</span></span>
        </div>
        <div className="profile-stat"><span>Connections</span><strong>{profile.connections.toLocaleString('en-AU')}</strong></div>
        <Link href="/profile" className="profile-link">View profile</Link>
      </div>

      <div className="card">
        <Link href="/profile" className="reach-row"><span>Profile viewers</span><strong>{s.profileViewers ?? '—'}</strong></Link>
        <Link href="/" className="reach-row"><span>Post impressions</span><strong>{s.postImpressions ?? '—'}</strong></Link>
      </div>

      <div className="card">
        <div className="reach-row"><span>Posts</span><strong>{s.posts ?? '—'}</strong></div>
        <div className="reach-row"><span>Comments made</span><strong>{s.commentsMade ?? '—'}</strong></div>
        <div className="reach-row"><span>Connections</span><strong>{s.connections ?? '—'}</strong></div>
      </div>
    </>
  );
}
