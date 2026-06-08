import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	AUTH_HOME_PATH,
	AUTH_SIGNIN_PATH,
	getAuthToken,
} from '@/lib/auth-env';

const PROTECTED_PATHS = [
	'/',
	'/user-management',
	'/product-approval',
	'/store-approval',
	'/store-registration',
	'/escrow-management',
	'/order-disputes',
	'/landing-page-management',
	'/product-settings-management',
	'/category-management',
	'/customer-queries',
];

function isProtectedPath(pathname: string) {
	return PROTECTED_PATHS.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = await getAuthToken(request);

	if (!token && isProtectedPath(pathname)) {
		const signInUrl = new URL(AUTH_SIGNIN_PATH, request.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	if (token && pathname === AUTH_SIGNIN_PATH) {
		return NextResponse.redirect(new URL(AUTH_HOME_PATH, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|img|.*\\..*).*)',
	],
};
