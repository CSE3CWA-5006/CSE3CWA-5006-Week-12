'use client';
/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// PeopleYouMayKnow.jsx — right-column card with suggested connections (passed in).
import Link from 'next/link';
import Avatar from './Avatar.jsx';

export default function PeopleYouMayKnow({ people = [] }) {
  if (people.length === 0) return null;
  return (
    <div className="card">
      <h3 className="card-title">People you may know</h3>
      <ul className="pymk-list">
        {people.map((u) => (
          <li key={u.id} className="pymk-row">
            <Avatar seed={u.name} size={40} />
            <span className="pymk-text">
              <Link href={`/profile/${u.id}`} className="pymk-name">{u.name}</Link>
              <span className="muted">{u.role}</span>
            </span>
          </li>
        ))}
      </ul>
      <Link href="/network" className="profile-link">See all in My Network</Link>
    </div>
  );
}
