import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ROUTES } from '@/constants/routes';
import { getAppOrigin } from '@/constants/app';
import { getSessionCookieOptions } from '@/lib/auth-session';
import { comparePassword } from './hashPassword';
import prisma from './prisma';

const sessionCookie = getSessionCookieOptions();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username },
          });

          if (!admin?.password) {
            return null;
          }

          const valid = await comparePassword(
            credentials.password,
            admin.password
          );

          if (!valid) {
            return null;
          }

          return {
            id: admin.id,
            name: admin.username,
            email: admin.username,
          };
        } catch (error) {
          console.error('[auth] authorize failed:', error);
          return null;
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: sessionCookie.name,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: sessionCookie.secure,
      },
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: ROUTES.login,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const origin = baseUrl || getAppOrigin();

      if (url.startsWith('/')) {
        return `${origin}${url}`;
      }
      if (url.startsWith(origin)) {
        return url;
      }
      return `${origin}${ROUTES.dashboard}`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | undefined) ?? null;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
