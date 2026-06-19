import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/auth-helpers';
import { listUsers } from '@/lib/services/users.service.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/users -> everyone (used by search and suggestions).
export async function GET() {
  if (!(await currentUserId())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  return NextResponse.json(listUsers());
}
