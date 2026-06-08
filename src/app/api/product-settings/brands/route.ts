import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const subCategoryId = request.nextUrl.searchParams.get('subCategoryId');
    const brands = await prisma.brand.findMany({
      where: {
        ...(subCategoryId ? { subCategoryId } : {}),
      },
      include: {
        SubCategory: { select: { id: true, name: true, categoryId: true, category: { select: { name: true } } } },
        _count: { select: { Product: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subCategoryId, isActive = true } = body;

    if (!name?.trim() || !subCategoryId) {
      return NextResponse.json({ error: 'Name and subcategory are required' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: { name: name.trim(), subCategoryId, isActive },
      include: {
        SubCategory: { select: { id: true, name: true, category: { select: { name: true } } } },
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
