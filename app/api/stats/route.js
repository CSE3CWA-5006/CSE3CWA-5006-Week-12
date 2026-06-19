import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getStats } from '@/lib/services/stats.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/stats -> real numbers about the signed-in user (for the sidebar).
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getStats(me));
}
