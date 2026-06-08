type RequestWithHeaders = {
  headers: {
    get(name: string): string | null;
  };
  nextUrl?: {
    origin: string;
  };
};

/**
 * Resolve the app URL from the current request (host + port + protocol).
 * No hardcoded localhost URL — works on any port and Vercel domain.
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

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const port = process.env.PORT ?? '3000';
  return `http://127.0.0.1:${port}`;
}

/** Set NEXTAUTH_URL for this request so NextAuth uses the current URL/port. */
export function applyAuthUrlFromRequest(request?: RequestWithHeaders) {
  const url = resolveAuthUrl(request);
  process.env.NEXTAUTH_URL = url;
  process.env.AUTH_URL = url;
}
