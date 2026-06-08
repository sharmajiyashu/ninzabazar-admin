import {
  AUTH_ONLY_PATHS,
  LEGACY_REDIRECTS,
  PUBLIC_PATHS,
  ROUTES,
} from '@/constants/routes';

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some((path) => pathname === path);
}

export function resolveLegacyRedirect(pathname: string): string | null {
  return LEGACY_REDIRECTS[pathname] ?? null;
}

export function buildStoreReviewPath(storeId: string): string {
  return `${ROUTES.storeReview}?id=${encodeURIComponent(storeId)}`;
}

export function matchesPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
