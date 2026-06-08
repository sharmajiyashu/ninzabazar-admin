import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { resolveReviewStatus } from '@/lib/product-status';

const productInclude = {
  ProductImage: true,
  ProductVariant: {
    include: {
      ProductVariantImage: true,
    },
  },
  SellerProfile: {
    include: {
      User: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  Category: true,
  SubCategory: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: productInclude,
    });

    const formattedProducts = products.map((product: ProductWithRelations) => {
      const reviewStatus = resolveReviewStatus(
        product.status,
        product.adminApproved
      );
      const statusLabel =
        reviewStatus === 'approved'
          ? 'approved'
          : reviewStatus === 'rejected'
            ? 'rejected'
            : 'under review';

      const storeProfile = product.SellerProfile;
      const storeOwner = storeProfile?.User
        ? `${storeProfile.User.firstName} ${storeProfile.User.lastName}`
        : 'N/A';

      return {
        id: product.id,
        productName: product.name,
        description: product.description,
        storeId: product.sellerId,
        storeOwner,
        storeName: storeProfile
          ? storeProfile.shopName ||
            storeProfile.businessRegisteredName ||
            storeProfile.companyName ||
            'N/A'
          : 'N/A',
        category: product.Category?.name || 'Uncategorized',
        subCategory: product.SubCategory?.name || 'N/A',
        price: parseFloat(product.basePrice?.toString() || '0'),
        salePrice: product.salePrice
          ? parseFloat(product.salePrice.toString())
          : null,
        isSale: product.isSale,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        status: statusLabel,
        adminApproved: product.adminApproved,
        isActive: product.isActive,
        images: product.ProductImage.map((img) => ({
          id: img.id,
          url: img.urlpath,
          alt: img.alt || product.name,
          isDefault: img.isDefault,
        })),
        variants: product.ProductVariant.map((variant) => ({
          id: variant.id,
          title: variant.title,
          option: variant.option,
          price: parseFloat(variant.price.toString()),
          sku: variant.sku,
          images: variant.ProductVariantImage.map((img) => ({
            id: img.id,
            url: img.urlpath,
            alt:
              img.alt || `${product.name} - ${variant.title} - ${variant.option}`,
            isDefault: img.isDefault,
          })),
        })),
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, adminApproved } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: 'Failed to update product status' },
      { status: 500 }
    );
  }
}
