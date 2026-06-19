// auth-helpers.js — read the logged-in user inside API route handlers.
import { auth } from '../auth.js';

// Returns the local database user id of the signed-in user, or null.
export async function currentUserId() {
  const session = await auth();
  return session?.uid ?? null;
}
