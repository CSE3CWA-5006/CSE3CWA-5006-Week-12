/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/reset-demo-data -> restore the original fake dataset.
export async function POST() {
  return NextResponse.json({ message: 'Demo data has been reset.', counts: seedDatabase() });
}
