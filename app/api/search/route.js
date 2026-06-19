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
