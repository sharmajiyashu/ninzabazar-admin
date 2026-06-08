import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthToken } from '@/lib/auth-session';
import { API_PUBLIC_PREFIXES, ROUTES } from '@/constants/routes';
import {
  isAuthOnlyPath,
  isPublicPath,
  resolveLegacyRedirect,
} from '@/utils/routes';

function isApiPublicPath(pathname: string): boolean {
  return API_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyTarget = resolveLegacyRedirect(pathname);
  if (legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget;
    return NextResponse.redirect(url);
  }

  const token = await getAuthToken(request);
  const isAuthenticated = Boolean(token);

  if (pathname.startsWith('/api/')) {
    if (isApiPublicPath(pathname)) {
      return NextResponse.next();
    }
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isAuthOnlyPath(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if (!isPublicPath(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
