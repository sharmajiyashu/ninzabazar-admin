import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
	try {
		const products = await prisma.product.findMany({
			include: {
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
			},
		});

		// Format data for frontend display
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const formattedProducts = products.map((product: any) => ({
			id: product.id,
			productName: product.name,
			description: product.description,
			sellerId: product.sellerId,
			seller: `${product.SellerProfile.User.firstName} ${product.SellerProfile.User.lastName}`,
			storeName:
				product.SellerProfile.shopName ||
				product.SellerProfile.businessRegisteredName,
			category: product.category || 'Uncategorized',
			price: parseFloat(product.basePrice.toString()),
			salePrice: product.salePrice
				? parseFloat(product.salePrice.toString())
				: null,
			isSale: product.isSale,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			status: product.adminApproved ? 'approved' : 'under review',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			images: product.ProductImage.map((img: any) => ({
				id: img.id,
				url: img.urlpath,
				alt: img.alt || product.name,
				isDefault: img.isDefault,
			})),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			variants: product.ProductVariant.map((variant: any) => ({
				id: variant.id,
				title: variant.title,
				option: variant.option,
				price: parseFloat(variant.price.toString()),
				sku: variant.sku,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				images: variant.ProductVariantImage.map((img: any) => ({
					id: img.id,
					url: img.urlpath,
					alt:
						img.alt || `${product.name} - ${variant.title} - ${variant.option}`,
					isDefault: img.isDefault,
				})),
			})),
		}));

		return NextResponse.json(formattedProducts);
	} catch (error) {
		console.error('Error fetching products:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch products' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}

}
