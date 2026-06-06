import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const escrowPayments = await prisma.escrowPayment.findMany({
			include: {
				Order: {
					include: {
						BuyerProfile: {
							include: { User: true },
						},
						OrderItem: {
							include: {
								Product: {
									include: {
										ProductImage: true,
									},
								},
							},
						},
					},
				},

				Seller: {
					include: {
						User: true,
					},
				},
			},
		});
		return NextResponse.json(escrowPayments);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
