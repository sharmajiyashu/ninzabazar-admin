import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const orderId = searchParams.get('orderId');

		if (!orderId) {
			return NextResponse.json(
				{ message: 'Missing orderId parameter' },
				{ status: 400 }
			);
		}

		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				BuyerProfile: {
					include: {
						User: true,
					},
				},
				OrderItem: {
					include: {
						Product: {
							include: {
								ProductImage: true,
								SellerProfile: {
									include: {
										Address: true,
										StoreRatingSummary: true,
									},
								},
							},
						},
					},
				},
				EscrowPayment: true,
			},
		});

		return NextResponse.json(order);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
