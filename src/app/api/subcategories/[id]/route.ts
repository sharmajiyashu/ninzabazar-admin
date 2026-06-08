import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

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
    const categoryId = formData.get('categoryId') as string;
    const isTrending = formData.get('isTrending') === 'true';
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    const subcategory = await prisma.subCategory.findUnique({ where: { id } });
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    let imageUrl = subcategory.imageUrl;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `subcategory_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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

      if (subcategory.imageUrl && subcategory.imageUrl.includes('supabase.co/storage')) {
        try {
          const urlParts = subcategory.imageUrl.split(`/storage/v1/object/public/${bucket}/`);
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

    const updatedSubCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== null && { description }),
        ...(categoryId && { categoryId }),
        isTrending,
        isActive,
        imageUrl,
      },
    });

    return NextResponse.json(updatedSubCategory);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    const subcategory = await prisma.subCategory.findUnique({ where: { id } });
    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    if (subcategory.imageUrl && subcategory.imageUrl.includes('supabase.co/storage')) {
      try {
        const bucket = 'categories';
        const urlParts = subcategory.imageUrl.split(`/storage/v1/object/public/${bucket}/`);
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await supabase.storage.from(bucket).remove([filePath]);
        }
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    await prisma.subCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}
