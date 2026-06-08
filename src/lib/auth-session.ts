import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export function getAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

/** Use secure cookies only on HTTPS deployments, not on local `npm start`. */
export function shouldUseSecureCookies(): boolean {
  if (process.env.AUTH_COOKIE_SECURE === 'true') return true;
  if (process.env.AUTH_COOKIE_SECURE === 'false') return false;
  return process.env.VERCEL === '1';
}

export function getSessionCookieName(secure: boolean): string {
  return secure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
}

export async function getAuthToken(request: NextRequest) {
  const secret = getAuthSecret();
  if (!secret) return null;

  const preferSecure = shouldUseSecureCookies();
  const attempts = preferSecure ? [true, false] : [false, true];

  for (const secureCookie of attempts) {
    const token = await getToken({
      req: request,
      secret,
      secureCookie,
      cookieName: getSessionCookieName(secureCookie),
    });
    if (token) return token;
  }

  return null;
}

export function getSessionCookieOptions() {
  const secure = shouldUseSecureCookies();
  const prefix = secure ? '__Secure-' : '';

  return {
    secure,
    prefix,
    name: `${prefix}next-auth.session-token`,
  };
}
