// filepath: e:\ninja bazaar\admin-ninjabazaar\src\app\api\sellers\update\route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
	try {
		const body = await request.json();
		const { sellerId, isVerified, storeStatus } = body;

		if (!sellerId) {
			return NextResponse.json(
				{ error: 'Seller ID is required' },
				{ status: 400 }
			);
		}

		const updatedSeller = await prisma.sellerProfile.update({
			where: {
				id: sellerId,
			},
			data: {
				isVerified: isVerified,
				storeStatus: storeStatus,
				updatedAt: new Date(),
			},
			include: {
				User: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json(updatedSeller, { status: 200 });
	} catch (error) {
		console.error('Error updating seller profile:', error);
		return NextResponse.json(
			{ error: 'Failed to update seller profile' },
			{ status: 500 }
		);
	}
}
