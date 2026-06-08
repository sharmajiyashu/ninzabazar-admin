import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const AUTH_HOME_PATH = '/';
export const AUTH_SIGNIN_PATH = '/signin';

/** Canonical production URL — used on Vercel when env vars are not set. */
export const PRODUCTION_APP_URL = 'https://ninzabazar-admin.vercel.app';

type RequestWithHeaders = {
  headers: {
    get(name: string): string | null;
  };
  nextUrl?: {
    origin: string;
    protocol?: string;
  };
};

export function isVercelDeployment() {
  return process.env.VERCEL === '1';
}

export function getConfiguredAppUrl(): string | undefined {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  return url?.replace(/\/$/, '');
}

/**
 * Resolve auth base URL:
 * - Local dev: current request origin (any port)
 * - Vercel/live: request origin, or configured env URL, or production fallback
 */
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

  if (isVercelDeployment()) {
    return getConfiguredAppUrl() ?? PRODUCTION_APP_URL;
  }

  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

/** Set NEXTAUTH_URL before NextAuth runs (required for cookies on HTTPS). */
export function applyAuthUrlFromRequest(request?: RequestWithHeaders) {
  const url = resolveAuthUrl(request);
  process.env.NEXTAUTH_URL = url;
  process.env.AUTH_URL = url;
}

/** Initialize auth env on server startup (Vercel cold starts). */
export function initAuthEnv() {
  if (isVercelDeployment()) {
    const url = getConfiguredAppUrl() ?? PRODUCTION_APP_URL;
    process.env.NEXTAUTH_URL = url;
    process.env.AUTH_URL = url;
  }
}

/**
 * Read session JWT from cookies.
 * Tries both secure and non-secure cookie names (HTTP local vs HTTPS Vercel).
 */
export async function getAuthToken(request: NextRequest) {
  applyAuthUrlFromRequest(request);

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    console.error('[auth] NEXTAUTH_SECRET is not set');
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
