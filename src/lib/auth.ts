import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { AUTH_HOME_PATH, AUTH_SIGNIN_PATH } from '@/lib/auth-env';

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(callbackPath?: string) {
  const session = await getAuthSession();
  if (!session) {
    const signInUrl = callbackPath
      ? `${AUTH_SIGNIN_PATH}?callbackUrl=${encodeURIComponent(callbackPath)}`
      : AUTH_SIGNIN_PATH;
    redirect(signInUrl);
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getAuthSession();
  if (session) {
    redirect(AUTH_HOME_PATH);
  }
}
