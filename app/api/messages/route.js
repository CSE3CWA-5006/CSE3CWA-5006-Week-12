import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getThreads } from '@/lib/services/messages.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/messages -> my conversations (one row per person, newest first).
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getThreads(me));
}
