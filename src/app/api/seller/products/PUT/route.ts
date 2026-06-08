import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, adminApproved } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (typeof adminApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'adminApproved must be a boolean' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: adminApproved
        ? {
            adminApproved: true,
            status: 'approved',
            // Seller turns listing on after approval
            isActive: false,
          }
        : {
            adminApproved: false,
            status: 'rejected',
            isActive: false,
          },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product approval status:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
  }
}
