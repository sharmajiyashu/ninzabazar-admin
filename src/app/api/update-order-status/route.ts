import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { orderId, status } = body;

		// Basic validation
		if (!orderId || !status) {
			return NextResponse.json(
				{ error: 'Missing orderId or status' },
				{ status: 400 }
			);
		}

		const allowedStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
		if (!allowedStatuses.includes(status)) {
			return NextResponse.json(
				{ error: 'Invalid status value' },
				{ status: 400 }
			);
		}

		// Update the order
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: {
				status,
			},
		});

		return NextResponse.json({ success: true, updatedOrder });
	} catch (error) {
		console.error('[UPDATE_ORDER_STATUS]', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
