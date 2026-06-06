import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client (add these environment variables in your .env file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Get the seller profile to find the document path
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        id: sellerId
      },
      select: {
        businessDocumentFile: true,
        businessDocumentType: true,
      }
    });

    if (!sellerProfile || !sellerProfile.businessDocumentFile) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if the document file is a URL (starts with http:// or https://)
    const isSupabaseUrl = sellerProfile.businessDocumentFile.includes('supabase.co/storage');

    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (sellerProfile.businessDocumentFile.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (sellerProfile.businessDocumentFile.endsWith('.jpg') || sellerProfile.businessDocumentFile.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (sellerProfile.businessDocumentFile.endsWith('.png')) {
      contentType = 'image/png';
    }
    
    let fileBuffer;

    if (isSupabaseUrl) {
      console.log(`Fetching document from Supabase: ${sellerProfile.businessDocumentFile}`);
      
      const urlParts = sellerProfile.businessDocumentFile.split('/storage/v1/object/public/');
      
      if (urlParts.length !== 2) {
        throw new Error('Invalid Supabase storage URL format');
      }
      
      const [bucketAndPath] = urlParts[1].split('/');
      const bucket = bucketAndPath;
      const filePath = urlParts[1].substring(bucket.length + 1); // +1 for the slash
      
      console.log(`Bucket: ${bucket}, File path: ${filePath}`);
      
      // Create a signed URL (valid for 60 seconds)
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60);
      
      if (error || !data?.signedUrl) {
        console.error('Error creating signed URL:', error);
        throw new Error(`Failed to create signed URL: ${error?.message || 'Unknown error'}`);
      }
      
      // Use the signed URL to fetch the file
      const fileResponse = await fetch(data.signedUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch document with signed URL, status: ${fileResponse.status}`);
      }
      
      fileBuffer = await fileResponse.arrayBuffer();
    } 
    // For direct public URLs, try a simple fetch
    else if (/^https?:\/\//i.test(sellerProfile.businessDocumentFile)) {
      console.log(`Fetching document from URL: ${sellerProfile.businessDocumentFile}`);
      
      const fileResponse = await fetch(sellerProfile.businessDocumentFile);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch document, status: ${fileResponse.status}`);
      }
      
      fileBuffer = await fileResponse.arrayBuffer();
    }
    // Otherwise treat it as a local file path
    else {
      const filePath = path.join(process.cwd(), 'public', 'uploads', sellerProfile.businessDocumentFile);
      console.log(`Reading document from local path: ${filePath}`);
      fileBuffer = fs.readFileSync(filePath);
    }

    // Return the file data
    const uint8Array = new Uint8Array(fileBuffer);
    const response = new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(sellerProfile.businessDocumentFile)}"`,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error retrieving document:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}