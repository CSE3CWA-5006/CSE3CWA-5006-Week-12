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
