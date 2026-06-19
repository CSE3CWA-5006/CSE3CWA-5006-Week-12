import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getNetwork } from '@/lib/services/network.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/network -> { connections, suggestions } for the signed-in user.
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getNetwork(me));
}
