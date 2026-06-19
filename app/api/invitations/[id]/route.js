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
