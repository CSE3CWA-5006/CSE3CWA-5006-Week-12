/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { search } from '@/lib/services/users.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/search?q=... -> { users, posts } that match the query.
export async function GET(request) {
  if (!(await currentUserId())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const q = (new URL(request.url).searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ users: [], posts: [] });
  return NextResponse.json(search(q));
}
