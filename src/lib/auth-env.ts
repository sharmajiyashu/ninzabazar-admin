import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const AUTH_HOME_PATH = '/';
export const AUTH_SIGNIN_PATH = '/signin';

/** Canonical live URL */
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

export function isLocalhost(host: string) {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export function getConfiguredAppUrl(): string | undefined {
  const url = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  return url?.replace(/\/$/, '');
}

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
        (isLocalhost(host) ? 'http' : 'https');
      return `${protocol}://${host}`;
    }
  }

  if (isVercelDeployment()) {
    return getConfiguredAppUrl() ?? PRODUCTION_APP_URL;
  }

  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

export function usesSecureCookies(request?: RequestWithHeaders): boolean {
  const url = resolveAuthUrl(request);
  return url.startsWith('https://');
}

export function applyAuthUrlFromRequest(request?: RequestWithHeaders) {
  const url = resolveAuthUrl(request);
  process.env.NEXTAUTH_URL = url;
  process.env.AUTH_URL = url;
}

/** Set auth URL on Vercel cold starts (no request context yet). */
export function initAuthEnv() {
  if (isVercelDeployment()) {
    const url = getConfiguredAppUrl() ?? PRODUCTION_APP_URL;
    process.env.NEXTAUTH_URL = url;
    process.env.AUTH_URL = url;
  }
}

export function getSessionCookieName(secure: boolean) {
  return secure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
}

export async function getAuthToken(request: NextRequest) {
  applyAuthUrlFromRequest(request);

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return null;
  }

  const preferSecure = usesSecureCookies(request);

  for (const secureCookie of preferSecure ? [true, false] : [false, true]) {
    const token = await getToken({
      req: request,
      secret,
      secureCookie,
      cookieName: getSessionCookieName(secureCookie),
    });
    if (token) {
      return token;
    }
  }

  return null;
}
