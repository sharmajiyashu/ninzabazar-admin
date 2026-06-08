import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const db = prisma as typeof prisma & {
  productColor: { findMany: Function; create: Function; update: Function; delete: Function };
};

export async function GET() {
  try {
    const colors = await db.productColor.findMany({
      include: { _count: { select: { ProductOnColor: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hexCode, isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const color = await db.productColor.create({
      data: { name: name.trim(), hexCode: hexCode || null, isActive },
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
}
