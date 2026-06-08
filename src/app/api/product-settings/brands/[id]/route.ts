import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const db = prisma as typeof prisma & {
  brand: { update: Function; delete: Function };
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, subCategoryId, isActive } = body;

    const brand = await db.brand.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(subCategoryId !== undefined && { subCategoryId }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
