import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				email: true,
				role: true,
				firstName: true,
				middleName: true,
				lastName: true,
				suffix: true,
				contactNumber: true,
				createdAt: true,
				updatedAt: true,
				profilePicture: true,
				status: true,
			},
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error('Failed to fetch users:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
