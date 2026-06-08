'use client';

import { getCsrfToken } from 'next-auth/react';
import { ROUTES } from '@/constants/routes';

type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

function hasAuthError(url: string): boolean {
  return url.includes('error=');
}

function isDashboardRedirect(url: string): boolean {
  try {
    const parsed = url.startsWith('http')
      ? new URL(url)
      : new URL(url, window.location.origin);
    return parsed.pathname === ROUTES.dashboard;
  } catch {
    return url === ROUTES.dashboard || url.endsWith(ROUTES.dashboard);
  }
}

/** Direct credentials login — avoids NextAuth signIn() bug with relative redirect URLs. */
export async function loginWithCredentials(
  username: string,
  password: string
): Promise<LoginResult> {
  const csrfToken = await getCsrfToken();

  const response = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      csrfToken: csrfToken ?? '',
      username: username.trim(),
      password,
      callbackUrl: ROUTES.dashboard,
      json: 'true',
    }),
  });

  let data: { url?: string } = {};
  try {
    data = (await response.json()) as { url?: string };
  } catch {
    return { ok: false, error: 'Invalid response from server' };
  }

  const redirectUrl = data.url ?? '';

  if (hasAuthError(redirectUrl)) {
    return { ok: false, error: 'Incorrect username or password' };
  }

  if (response.ok && isDashboardRedirect(redirectUrl)) {
    return { ok: true };
  }

  return { ok: false, error: 'Incorrect username or password' };
}

export async function logoutAdmin(): Promise<void> {
  const csrfToken = await getCsrfToken();

  await fetch('/api/auth/signout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      csrfToken: csrfToken ?? '',
      callbackUrl: ROUTES.login,
      json: 'true',
    }),
  });

  window.location.href = ROUTES.login;
}
