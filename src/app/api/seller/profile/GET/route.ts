import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(Request: NextRequest) {
	try {
		const { searchParams } = new URL(Request.url);
		const sellerId = searchParams.get('id');

		// If an ID is provided, return just that specific seller profile
		if (sellerId) {
			const sellerProfile = await prisma.sellerProfile.findUnique({
				where: {
					id: sellerId,
				},
				include: {
					User: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					Address: true,
					PickupAddress: true,
				},
			});

			if (!sellerProfile) {
				return NextResponse.json(
					{ error: 'Seller profile not found' },
					{ status: 404 }
				);
			}

			// Format business address
			const businessAddress = sellerProfile.Address
				? `${sellerProfile.Address.street}, ${sellerProfile.Address.city}, ${sellerProfile.Address.state}, ${sellerProfile.Address.country} ${sellerProfile.Address.postalCode}`
				: 'Not specified';

			// Format pickup address
			const pickupAddress = sellerProfile.PickupAddress
				? `${sellerProfile.PickupAddress.street}, ${sellerProfile.PickupAddress.city}, ${sellerProfile.PickupAddress.state}, ${sellerProfile.PickupAddress.country} ${sellerProfile.PickupAddress.postalCode}`
				: 'Not specified';

			const country = sellerProfile.Address?.country || 'Not specified';

			// Return a single seller profile object
			return NextResponse.json({
				id: sellerProfile.id,
				userId: sellerProfile.userId,
				storeName: sellerProfile.shopName || sellerProfile.companyName,
				owner: `${sellerProfile.User.firstName} ${sellerProfile.User.lastName}`,
				businessType: sellerProfile.businessType || 'Not specified',
				businessEmail: sellerProfile.businessEmail || 'Not specified',
				storeStatus: sellerProfile.isVerified ? 'approved' : 'not reviewed',
				email: sellerProfile.User.email,
				country: country,
				businessAddress: businessAddress,
				pickupAddress: pickupAddress,
				businessRegisteredName:
					sellerProfile.businessRegisteredName || 'Not specified',
				individualRegisteredName:
					sellerProfile.individualRegisteredName || 'Not specified',
				returnPolicy: sellerProfile.returnsTerms || 'Not specified',
				shippingPolicy: sellerProfile.shippingTerms || 'Not specified',
				sellerEmail: sellerProfile.sellerEmail || 'Not specified',
				businessDocumentFile: sellerProfile.businessDocumentFile || null,
				documentType: sellerProfile.businessDocumentType || 'Not specified',
				sellerPhoneNumber: sellerProfile.sellerPhoneNumber || 'Not specified',
				businessPhoneNumber:
					sellerProfile.businessPhoneNumber || 'Not specified',
			});
		}

		// If no ID provided, fetch all seller profiles
		const sellerProfiles = await prisma.sellerProfile.findMany({
			include: {
				User: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				Address: true,
				PickupAddress: true,
			},
		});

		const storeData = sellerProfiles.map((profile) => {
			// Format addresses as before...
			// Rest of the mapping logic remains the same
			const businessAddress = profile.Address
				? `${profile.Address.street}, ${profile.Address.city}, ${profile.Address.state}, ${profile.Address.country} ${profile.Address.postalCode}`
				: 'Not specified';

			const pickupAddress = profile.PickupAddress
				? `${profile.PickupAddress.street}, ${profile.PickupAddress.city}, ${profile.PickupAddress.state}, ${profile.PickupAddress.country} ${profile.PickupAddress.postalCode}`
				: 'Not specified';

			const country = profile.Address?.country || 'Not specified';

			return {
				id: profile.id,
				userId: profile.userId,
				storeName: profile.shopName || profile.companyName,
				owner: `${profile.User.firstName} ${profile.User.lastName}`,
				businessType: profile.businessType || 'Not specified',
				businessEmail: profile.businessEmail || 'Not specified',
				isVerified: profile.isVerified,
				storeStatus: profile.storeStatus,
				email: profile.User.email,
				country: country,
				businessAddress: businessAddress,
				pickupAddress: pickupAddress,
				businessRegisteredName:
					profile.businessRegisteredName || 'Not specified',
				individualRegisteredName:
					profile.individualRegisteredName || 'Not specified',
				phoneNumber: profile.businessPhoneNumber || 'Not specified',
				returnPolicy: profile.returnsTerms || 'Not specified',
				shippingPolicy: profile.shippingTerms || 'Not specified',
				sellerEmail: profile.sellerEmail || 'Not specified',
				sellerPhoneNumber: profile.sellerPhoneNumber || 'Not specified',
			};
		});

		return NextResponse.json(storeData, { status: 200 });
	} catch (error) {
		console.error('Error fetching seller profiles:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch seller profiles' },
			{ status: 500 }
		);
	}
}
