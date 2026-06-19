import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { getNotifications } from '@/lib/services/notifications.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/notifications -> activity on my posts and connections.
export async function GET() {
  const me = await currentUserId();
  if (!me) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(getNotifications(me));
}
