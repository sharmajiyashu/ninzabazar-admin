import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
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

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isTrending = formData.get('isTrending') === 'true';
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    let imageUrl = category.imageUrl;

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = 'categories';

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      // Delete old image if it exists and is a supabase url
      if (category.imageUrl && category.imageUrl.includes('supabase.co/storage')) {
        try {
          const urlParts = category.imageUrl.split(`/storage/v1/object/public/${bucket}/`);
          if (urlParts.length === 2) {
            const oldFilePath = urlParts[1];
            await supabase.storage.from(bucket).remove([oldFilePath]);
          }
        } catch (e) {
          console.error("Failed to delete old image:", e);
        }
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== null && { description }),
        isTrending,
        isActive,
        imageUrl,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Delete image from Supabase if it exists
    if (category.imageUrl && category.imageUrl.includes('supabase.co/storage')) {
      try {
        const bucket = 'categories';
        const urlParts = category.imageUrl.split(`/storage/v1/object/public/${bucket}/`);
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await supabase.storage.from(bucket).remove([filePath]);
        }
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
