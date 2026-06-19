import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getThread, sendMessage } from '@/lib/services/messages.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/messages/:id -> the full conversation with that user.
export async function GET(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(getThread(me, Number(id)));
}

// POST /api/messages/:id -> send a message to that user.
export async function POST(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const { body } = await request.json().catch(() => ({}));
  if (!body || !body.trim()) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
  return NextResponse.json(sendMessage(me, Number(id), body.trim()), { status: 201 });
}
