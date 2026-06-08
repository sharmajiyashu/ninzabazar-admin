import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {
  AUTH_HOME_PATH,
  initAuthEnv,
  isVercelDeployment,
  PRODUCTION_APP_URL,
} from './auth-env';
import { comparePassword } from './hashPassword';
import prisma from './prisma';

initAuthEnv();

const useSecureCookies =
  isVercelDeployment() ||
  process.env.NEXTAUTH_URL?.startsWith('https://') ||
  process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');

const cookiePrefix = useSecureCookies ? '__Secure-' : '';

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
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !!useSecureCookies,
      },
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const safeBase = baseUrl || PRODUCTION_APP_URL;
      if (url.startsWith('/')) {
        return `${safeBase}${url}`;
      }
      if (url.startsWith(safeBase)) {
        return url;
      }
      return `${safeBase}${AUTH_HOME_PATH}`;
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
