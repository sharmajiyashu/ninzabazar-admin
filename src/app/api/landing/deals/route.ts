import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  adminCreateLandingDeal,
  adminFetchLandingDeals,
} from '@/lib/landing-page-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const deals = await adminFetchLandingDeals();
    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching landing deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const bgColor = (formData.get('bgColor') as string) || '#0a8558';
    const linkUrl = (formData.get('linkUrl') as string) || null;
    const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;
    const imageUrlInput = formData.get('imageUrl') as string | null;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    let imageUrl = imageUrlInput || '';

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

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const deal = await adminCreateLandingDeal({
      title,
      description,
      imageUrl,
      bgColor,
      linkUrl,
      sortOrder,
      isActive,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Error creating landing deal:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
