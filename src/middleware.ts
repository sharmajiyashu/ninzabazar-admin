import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applyAuthUrlFromRequest } from '@/lib/auth-env';

export async function middleware(request: NextRequest) {
	applyAuthUrlFromRequest(request);
	const pathname = request.nextUrl.pathname;

	console.log('Middleware running for:', pathname);

	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	console.log('Token found:', !!token);
	console.log(
		'Token details:',
		token ? { email: token.email, role: token.role } : 'No token'
	);

	// define paths
	const home = '/';
	const signIn = '/signin';
	const userManagement = '/user-management';
	const productApproval = '/product-approval';
	const storeApproval = '/store-approval';
	const storeRegistration = '/store-registration';
	const escrowManagement = '/escrow-management';
	const orderDisputes = '/order-disputes';
	const landingPageManagement = '/landing-page-management';
	const productSettingsManagement = '/product-settings-management';

	const protectedRoutes = [
		home,
		userManagement,
		productApproval,
		storeApproval,
		storeRegistration,
		escrowManagement,
		orderDisputes,
		landingPageManagement,
		productSettingsManagement,
	];

	console.log('Is protected route:', protectedRoutes.includes(pathname));

	// Redirect to login if not authenticated and trying to access protected route
	if (!token && protectedRoutes.includes(pathname)) {
		console.log('Redirecting to login - no token');
		return NextResponse.redirect(new URL(signIn, request.url));
	}

	// Redirect to user management if already authenticated and trying to access login
	if (token && pathname === signIn) {
		console.log('Redirecting to user management - already logged in');
		return NextResponse.redirect(new URL(userManagement, request.url));
	}

	console.log('Allowing request to continue');
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/',
		'/user-management/:path*',
		'/product-approval/:path*',
		'/store-approval/:path*',
		'/store-registration/:path*',
		'/escrow-management/:path*',
		'/order-disputes/:path*',
		'/landing-page-management/:path*',
		'/product-settings-management/:path*',
		'/signin',
	],
};
