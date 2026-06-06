import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const orders = await prisma.order.findMany({
			include: {
				BuyerProfile: {
					include: {
						User: true, // include nested user data
					},
				},
				OrderItem: {
					include: {
						Product: {
							include: {
								ProductImage: true,
								SellerProfile: true,
							},
						},
					},
				},
				EscrowPayment: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return NextResponse.json({ orders });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
