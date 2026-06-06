import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/hashPassword';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { username, password } = body;

		// Validate input
		if (!username || !password) {
			return NextResponse.json(
				{ error: 'Username and password are required' },
				{ status: 400 }
			);
		}

		// Check if admin with this username already exists
		const existingAdmin = await prisma.admin.findUnique({
			where: { username },
		});

		if (existingAdmin) {
			return NextResponse.json(
				{ error: 'Admin with this username already exists' },
				{ status: 409 }
			);
		}

		// Hash the password
		const hashedPassword = await hashPassword(password);

		// Create the admin
		const admin = await prisma.admin.create({
			data: {
				username,
				password: hashedPassword,
			},
		});

		return NextResponse.json(
			{
				message: 'Admin registered successfully',
				admin: {
					id: admin.id,
					username: admin.username,
					createdAt: admin.createdAt,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Admin registration error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
