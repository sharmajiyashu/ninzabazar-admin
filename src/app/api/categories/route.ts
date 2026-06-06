import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // @ts-ignore
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { subCategories: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isTrending = formData.get('isTrending') === 'true';
    const isActive = formData.get('isActive') !== 'false'; // Default true
    const imageFile = formData.get('image') as File | null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check if category exists
    // @ts-ignore
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
    }

    let imageUrl = null;

    // Handle image upload to Supabase
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // Create the category in the database
    // @ts-ignore
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        isTrending,
        isActive,
        imageUrl,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
