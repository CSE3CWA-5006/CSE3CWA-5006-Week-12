/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getUserById, updateProfile } from '@/lib/services/users.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/profile -> the signed-in user.
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getUserById(me));
}

// PUT /api/profile -> save edits to the signed-in user's profile.
export async function PUT(request) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const fields = await request.json().catch(() => ({}));
  return NextResponse.json(updateProfile(me, fields));
}
