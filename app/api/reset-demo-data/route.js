import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/reset-demo-data -> restore the original fake dataset.
export async function POST() {
  return NextResponse.json({ message: 'Demo data has been reset.', counts: seedDatabase() });
}
