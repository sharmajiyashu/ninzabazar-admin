import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  adminDeleteLandingDeal,
  adminFetchLandingDeals,
  adminUpdateLandingDeal,
} from '@/lib/landing-page-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const bgColor = formData.get('bgColor') as string;
    const linkUrl = formData.get('linkUrl') as string | null;
    const sortOrder = formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string, 10) : undefined;
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;
    const imageUrlInput = formData.get('imageUrl') as string | null;

    const existing = (await adminFetchLandingDeals()).find((d: { id: string }) => d.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    let imageUrl = imageUrlInput || (existing as { imageUrl: string }).imageUrl;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `deal_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage.from('categories').upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true,
      });

      if (error) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('categories').getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const deal = await adminUpdateLandingDeal(id, {
      title,
      description,
      imageUrl,
      bgColor,
      linkUrl: linkUrl || null,
      sortOrder,
      isActive,
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error updating landing deal:', error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDeleteLandingDeal(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting landing deal:', error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
