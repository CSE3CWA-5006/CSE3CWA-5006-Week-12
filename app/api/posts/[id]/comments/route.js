import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getComments, addComment, postExists } from '@/lib/services/posts.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/posts/:id/comments -> list a post's comments.
export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json(getComments(Number(id)));
}

// POST /api/posts/:id/comments -> add a comment.
export async function POST(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  if (!postExists(Number(id))) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  const { content } = await request.json().catch(() => ({}));
  if (!content || !content.trim()) return NextResponse.json({ error: 'Comment text is required.' }, { status: 400 });
  return NextResponse.json(addComment(Number(id), me, content.trim()), { status: 201 });
}
