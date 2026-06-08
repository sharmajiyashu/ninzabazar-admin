import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { authOptions } from '@/lib/authOptions';

export async function getAuthSession() {
  return getServerSession(authOptions);
}

/** Server-side guard for pages not covered by middleware edge cases. */
export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    redirect(ROUTES.login);
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getAuthSession();
  if (session) {
    redirect(ROUTES.dashboard);
  }
}
