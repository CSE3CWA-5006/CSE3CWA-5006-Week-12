import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getFeed } from '@/lib/services/feed.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/feed -> the whole feed, newest first.
export async function GET() {
  if (!(await currentUserId())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getFeed());
}
