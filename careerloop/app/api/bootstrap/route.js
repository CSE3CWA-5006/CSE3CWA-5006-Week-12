/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { db } from '@/lib/db/database.js';
import { getUserById } from '@/lib/services/users.service.js';
import { getFeed } from '@/lib/services/feed.service.js';
import { getNetwork } from '@/lib/services/network.service.js';
import { getStats } from '@/lib/services/stats.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/bootstrap -> everything the Home page needs, in ONE request.
// Loading the feed page through a single endpoint keeps the first paint fast.
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json({
    profile: getUserById(me),
    topics: db.prepare('SELECT * FROM topics ORDER BY post_count DESC').all(),
    feed: getFeed(),
    suggestions: getNetwork(me).suggestions.slice(0, 3),
    stats: getStats(me),
  });
}
