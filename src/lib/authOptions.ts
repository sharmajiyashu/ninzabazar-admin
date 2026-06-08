import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH_HOME_PATH, initAuthEnv } from './auth-env';
import { comparePassword } from './hashPassword';
import prisma from './prisma';

initAuthEnv();

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.username || !credentials?.password) {
						return null;
					}

					const admin = await prisma.admin.findUnique({
						where: {
							username: credentials.username,
						},
					});

					if (!admin?.password) {
						return null;
					}

					const validatePassword = await comparePassword(
						credentials.password,
						admin.password
					);

					if (!validatePassword) {
						return null;
					}

					return {
						id: admin.id.toString(),
						name: admin.username,
					};
				} catch (error) {
					console.error('Login authorize error:', error);
					return null;
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	pages: {
		signIn: '/signin',
	},
	callbacks: {
		async redirect({ url, baseUrl }) {
			if (url.startsWith('/')) {
				return `${baseUrl}${url}`;
			}
			if (url.startsWith(baseUrl)) {
				return url;
			}
			return `${baseUrl}${AUTH_HOME_PATH}`;
		},
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = (user as { id?: string }).id || token.id;
				token.name = (user as { name?: string | null }).name || token.name;
			}
			return token;
		},
		session: async ({ session, token }) => {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
};

export default NextAuth(authOptions);
