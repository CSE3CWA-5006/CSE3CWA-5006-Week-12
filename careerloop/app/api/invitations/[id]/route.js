/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { respondInvitation } from '@/lib/services/network.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/invitations/:requestId  body {accept:true|false}
// Accept or decline a connection request that was sent to me.
export async function POST(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const { accept } = await request.json().catch(() => ({}));
  const ok = respondInvitation(me, Number(id), !!accept);
  if (!ok) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  return NextResponse.json({ accepted: !!accept });
}
