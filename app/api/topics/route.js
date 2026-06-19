import { NextResponse } from 'next/server';
import { db } from '@/lib/db/database.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/topics -> trending topics, most popular first.
export async function GET() {
  return NextResponse.json(db.prepare('SELECT * FROM topics ORDER BY post_count DESC').all());
}
