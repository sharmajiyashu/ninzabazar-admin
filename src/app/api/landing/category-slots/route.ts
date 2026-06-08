import { NextResponse } from 'next/server';
import {
  adminFetchCategorySlots,
  adminReplaceCategorySlots,
} from '@/lib/landing-page-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slotType = searchParams.get('slotType') || undefined;
    const slots = await adminFetchCategorySlots(slotType);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching category slots:', error);
    return NextResponse.json({ error: 'Failed to fetch category slots' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slotType, categoryIds } = body as { slotType: string; categoryIds: string[] };

    if (!slotType || !Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const slots = await adminReplaceCategorySlots(slotType, categoryIds);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error updating category slots:', error);
    return NextResponse.json({ error: 'Failed to update category slots' }, { status: 500 });
  }
}
