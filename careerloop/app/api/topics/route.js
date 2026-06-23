/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/database.js';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/topics -> trending topics, most popular first.
export async function GET() {
  return NextResponse.json(db.prepare('SELECT * FROM topics ORDER BY post_count DESC').all());
}
