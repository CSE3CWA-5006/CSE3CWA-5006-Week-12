import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { requestConnect, disconnect } from '@/lib/services/network.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/connections/:id -> send a connection REQUEST (with a short message).
export async function POST(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const { message } = await request.json().catch(() => ({}));
  requestConnect(me, Number(id), message);
  return NextResponse.json({ status: 'pending' });
}

// DELETE /api/connections/:id -> remove a connection or cancel a request.
export async function DELETE(request, { params }) {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  disconnect(me, Number(id));
  return NextResponse.json({ status: 'none' });
}
