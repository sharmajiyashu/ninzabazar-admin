import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePassword } from './hashPassword';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
	// Configure one or more authentication providers
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				console.log('Login attempt for username:', credentials?.username);
				if (!credentials?.username || !credentials?.password) {
					throw new Error('Please enter your username and password');
				}

				const admin = await prisma.admin.findUnique({
					where: {
						username: credentials.username,
					},
				});

				console.log('Admin found:', !!admin);
				if (!admin) {
					throw new Error('Admin not found');
				}

				if (!admin.password) {
					throw new Error('Admin password is missing');
				}

				const validatePassword = await comparePassword(
					credentials.password,
					admin.password
				);
				console.log('Password validation result:', validatePassword);

				if (!validatePassword) {
					throw new Error('Invalid password');
				}

				return {
					id: admin.id.toString(),
					name: admin.username,
				};
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: '/signin',
	},
	callbacks: {
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
