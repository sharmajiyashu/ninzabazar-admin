import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = categoryId ? { categoryId } : {};

    // @ts-ignore
    const subcategories = await prisma.subCategory.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const isTrending = formData.get('isTrending') === 'true';
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and Category ID are required' }, { status: 400 });
    }

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `subcategory_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = 'categories';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // @ts-ignore
    const newSubCategory = await prisma.subCategory.create({
      data: {
        name,
        description,
        categoryId,
        isTrending,
        isActive,
        imageUrl,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    const websiteBase = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const productsUrl = `${websiteBase}/products?category=${encodeURIComponent(newSubCategory.category.name)}&subCategory=${encodeURIComponent(newSubCategory.name)}`;

    return NextResponse.json({ ...newSubCategory, productsUrl }, { status: 201 });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}
