import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
	const { searchParams } = new URL(req.url);
	const transactionId = searchParams.get('transactionId');

	if (!transactionId) {
		return NextResponse.json(
			{ error: 'Missing transactionId parameter' },
			{ status: 400 }
		);
	}

	try {
		const releaseEscrow = await prisma.escrowPayment.update({
			where: {
				id: transactionId,
			},
			data: {
				status: 'RELEASED',
				releasedAt: new Date(),
				updatedAt: new Date(),
			},
		});

		return NextResponse.json(releaseEscrow);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
