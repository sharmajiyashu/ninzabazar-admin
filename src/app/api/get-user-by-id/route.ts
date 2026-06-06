import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') ?? undefined;

		const user = await prisma.user.findUnique({
			where: {
				id: id,
			},
			include: {
				BuyerProfile: {
					include: { Address: true },
				},
				SellerProfile: {
					include: {
						Address: true,
						PickupAddress: true,
						StoreRatingSummary: true,
						Product: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Exclude password before sending response
		const { password, ...safeUser } = user; //eslint-disable-line

		return NextResponse.json(safeUser);
	} catch (error) {
		console.error('Error in get-user-by-id:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
