import type { IncomingHttpHeaders } from 'node:http';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';

export async function getSessionUserFromHeaders(headers: IncomingHttpHeaders) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });
  return session?.user ?? null;
}
