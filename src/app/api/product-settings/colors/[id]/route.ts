import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const db = prisma as typeof prisma & {
  productColor: { update: Function; delete: Function };
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, hexCode, isActive } = body;

    const color = await db.productColor.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(hexCode !== undefined && { hexCode: hexCode || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error updating color:', error);
    return NextResponse.json({ error: 'Failed to update color' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.productColor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
