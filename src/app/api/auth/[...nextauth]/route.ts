import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { applyAuthUrlFromRequest } from '@/lib/auth-env';

const authHandler = NextAuth(authOptions);

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function handler(req: NextRequest, context: RouteContext) {
  applyAuthUrlFromRequest(req);
  return authHandler(req, context);
}

export { handler as GET, handler as POST };
