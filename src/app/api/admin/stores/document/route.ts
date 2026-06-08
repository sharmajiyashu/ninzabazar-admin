import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const storeProfile = await prisma.sellerProfile.findUnique({
      where: { id: storeId },
      select: {
        businessDocumentFile: true,
        businessDocumentType: true,
      },
    });

    if (!storeProfile?.businessDocumentFile) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isSupabaseUrl = storeProfile.businessDocumentFile.includes(
      'supabase.co/storage'
    );

    let contentType = 'application/octet-stream';
    if (storeProfile.businessDocumentFile.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (
      storeProfile.businessDocumentFile.endsWith('.jpg') ||
      storeProfile.businessDocumentFile.endsWith('.jpeg')
    ) {
      contentType = 'image/jpeg';
    } else if (storeProfile.businessDocumentFile.endsWith('.png')) {
      contentType = 'image/png';
    }

    let fileBuffer: ArrayBuffer | Buffer;

    if (isSupabaseUrl) {
      const urlParts = storeProfile.businessDocumentFile.split(
        '/storage/v1/object/public/'
      );

      if (urlParts.length !== 2) {
        throw new Error('Invalid Supabase storage URL format');
      }

      const [bucketAndPath] = urlParts[1].split('/');
      const bucket = bucketAndPath;
      const filePath = urlParts[1].substring(bucket.length + 1);

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60);

      if (error || !data?.signedUrl) {
        throw new Error(
          `Failed to create signed URL: ${error?.message || 'Unknown error'}`
        );
      }

      const fileResponse = await fetch(data.signedUrl);
      if (!fileResponse.ok) {
        throw new Error(
          `Failed to fetch document with signed URL, status: ${fileResponse.status}`
        );
      }

      fileBuffer = await fileResponse.arrayBuffer();
    } else if (/^https?:\/\//i.test(storeProfile.businessDocumentFile)) {
      const fileResponse = await fetch(storeProfile.businessDocumentFile);
      if (!fileResponse.ok) {
        throw new Error(
          `Failed to fetch document, status: ${fileResponse.status}`
        );
      }

      fileBuffer = await fileResponse.arrayBuffer();
    } else {
      const filePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        storeProfile.businessDocumentFile
      );
      fileBuffer = fs.readFileSync(filePath);
    }

    const uint8Array =
      fileBuffer instanceof Buffer ? fileBuffer : new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(storeProfile.businessDocumentFile)}"`,
      },
    });
  } catch (error) {
    console.error('Error retrieving document:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
