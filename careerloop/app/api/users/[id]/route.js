/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getUserById } from '@/lib/services/users.service.js';
import { getRelation } from '@/lib/services/network.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/users/:id -> a user's public profile + my relationship to them.
export async function GET(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const user = getUserById(Number(id));
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  return NextResponse.json({ ...user, is_me: Number(id) === me, ...getRelation(me, Number(id)) });
}
