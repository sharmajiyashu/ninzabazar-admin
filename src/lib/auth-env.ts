import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const AUTH_HOME_PATH = '/';
export const AUTH_SIGNIN_PATH = '/signin';

type RequestWithHeaders = {
  headers: {
    get(name: string): string | null;
  };
  nextUrl?: {
    origin: string;
    protocol?: string;
  };
};

export function resolveAuthUrl(request?: RequestWithHeaders): string {
  if (request?.nextUrl?.origin) {
    return request.nextUrl.origin;
  }

  if (request) {
    const host =
      request.headers.get('x-forwarded-host') ?? request.headers.get('host');

    if (host) {
      const protocol =
        request.headers.get('x-forwarded-proto') ??
        (host.startsWith('localhost') || host.startsWith('127.0.0.1')
          ? 'http'
          : 'https');
      return `${protocol}://${host}`;
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

/** Set NEXTAUTH_URL for auth API handlers (cookie creation). */
export function applyAuthUrlFromRequest(request?: RequestWithHeaders) {
  const url = resolveAuthUrl(request);
  process.env.NEXTAUTH_URL = url;
  process.env.AUTH_URL = url;
}

/**
 * Read session JWT from request cookies.
 * Tries both secure and non-secure cookie names to avoid redirect loops.
 */
export async function getAuthToken(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }

  for (const secureCookie of [true, false]) {
    const token = await getToken({
      req: request,
      secret,
      secureCookie,
    });
    if (token) {
      return token;
    }
  }

  return null;
}
