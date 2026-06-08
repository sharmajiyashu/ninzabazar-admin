import { NextResponse } from 'next/server';
import {
  adminFetchProductSlots,
  adminReplaceProductSlots,
} from '@/lib/landing-page-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionKey = searchParams.get('sectionKey') || undefined;
    const slots = await adminFetchProductSlots(sectionKey);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching product slots:', error);
    return NextResponse.json({ error: 'Failed to fetch product slots' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sectionKey, productIds } = body as { sectionKey: string; productIds: string[] };

    if (!sectionKey || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const slots = await adminReplaceProductSlots(sectionKey, productIds);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error updating product slots:', error);
    return NextResponse.json({ error: 'Failed to update product slots' }, { status: 500 });
  }
}
