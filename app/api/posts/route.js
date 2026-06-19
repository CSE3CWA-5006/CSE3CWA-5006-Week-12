import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { createPost } from '@/lib/services/posts.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/posts -> publish a new post as the signed-in user.
export async function POST(request) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { content, topic, visibility } = await request.json().catch(() => ({}));
  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Post content is required.' }, { status: 400 });
  }
  return NextResponse.json(createPost(me, { content: content.trim(), topic, visibility }), { status: 201 });
}
