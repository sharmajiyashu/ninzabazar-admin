import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isProductLiveOnStore, liveProductWhere, resolveReviewStatus } from '@/lib/product-status';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim().toLowerCase() || '';

    const products = await prisma.product.findMany({
      where: liveProductWhere(),
      select: {
        id: true,
        name: true,
        basePrice: true,
        status: true,
        adminApproved: true,
        isActive: true,
        Category: { select: { name: true } },
        ProductImage: { where: { isDefault: true }, take: 1 },
        SellerProfile: {
          select: {
            companyName: true,
            shopName: true,
            businessRegisteredName: true,
            User: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products
      .map((p) => {
        const seller = p.SellerProfile;
        const sellerName =
          seller?.shopName ||
          seller?.companyName ||
          seller?.businessRegisteredName ||
          (seller?.User
            ? `${seller.User.firstName} ${seller.User.lastName}`.trim()
            : 'Unknown seller');

        return {
          id: p.id,
          name: p.name,
          price: parseFloat(p.basePrice.toString()),
          category: p.Category?.name || 'Uncategorized',
          image: p.ProductImage[0]?.urlpath || null,
          sellerName,
          reviewStatus: resolveReviewStatus(p.status, p.adminApproved),
          isLive: isProductLiveOnStore(p.status, p.adminApproved, p.isActive),
        };
      })
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching landing products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
