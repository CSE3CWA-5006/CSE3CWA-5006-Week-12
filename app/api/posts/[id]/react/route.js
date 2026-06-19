import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { addReaction, postExists } from '@/lib/services/posts.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/posts/:id/react -> add a reaction; returns the new total.
export async function POST(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  if (!postExists(Number(id))) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  const { type } = await request.json().catch(() => ({}));
  return NextResponse.json({ reactions: addReaction(Number(id), me, type) });
}
