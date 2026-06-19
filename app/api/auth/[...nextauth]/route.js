// Wires Auth.js into Next.js. All /api/auth/* requests are handled here.
import { handlers } from '@/auth';
export const runtime = 'nodejs';
export const { GET, POST } = handlers;
