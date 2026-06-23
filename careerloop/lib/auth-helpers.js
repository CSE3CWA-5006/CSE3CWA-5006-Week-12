/*
 * CareerLoop  -  Copyright (c) 2026 Dr Shuo Ding <shuoding@outlook.com>
 * Licensed under AGPL-3.0-or-later. Free to use and modify; any modified version
 * or network/SaaS deployment must keep this author copyright and stay under the AGPL.
 * DISCLAIMER: every name, job title and organisation here is fictitious and for
 * education only - no warranty, no liability. See the LICENSE file for full terms.
 */
// auth-helpers.js — read the logged-in user inside API route handlers.
import { auth } from '../auth.js';

// Returns the local database user id of the signed-in user, or null.
export async function currentUserId() {
  const session = await auth();
  return session?.uid ?? null;
}
