import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const materials = await prisma.productMaterial.findMany({
      include: { _count: { select: { ProductOnMaterial: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isActive = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const material = await prisma.productMaterial.create({
      data: { name: name.trim(), isActive },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
