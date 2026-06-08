import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (storeId) {
      const storeProfile = await prisma.sellerProfile.findUnique({
        where: { id: storeId },
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

      if (!storeProfile) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 });
      }

      const businessAddress = storeProfile.Address
        ? `${storeProfile.Address.street}, ${storeProfile.Address.city}, ${storeProfile.Address.state}, ${storeProfile.Address.country} ${storeProfile.Address.postalCode}`
        : 'Not specified';

      const pickupAddress = storeProfile.PickupAddress
        ? `${storeProfile.PickupAddress.street}, ${storeProfile.PickupAddress.city}, ${storeProfile.PickupAddress.state}, ${storeProfile.PickupAddress.country} ${storeProfile.PickupAddress.postalCode}`
        : 'Not specified';

      const country = storeProfile.Address?.country || 'Not specified';

      return NextResponse.json({
        id: storeProfile.id,
        userId: storeProfile.userId,
        storeName: storeProfile.shopName || storeProfile.companyName,
        owner: `${storeProfile.User.firstName} ${storeProfile.User.lastName}`,
        businessType: storeProfile.businessType || 'Not specified',
        businessEmail: storeProfile.businessEmail || 'Not specified',
        storeStatus: storeProfile.isVerified ? 'approved' : 'not reviewed',
        email: storeProfile.User.email,
        country,
        businessAddress,
        pickupAddress,
        businessRegisteredName:
          storeProfile.businessRegisteredName || 'Not specified',
        individualRegisteredName:
          storeProfile.individualRegisteredName || 'Not specified',
        returnPolicy: storeProfile.returnsTerms || 'Not specified',
        shippingPolicy: storeProfile.shippingTerms || 'Not specified',
        contactEmail: storeProfile.sellerEmail || 'Not specified',
        businessDocumentFile: storeProfile.businessDocumentFile || null,
        documentType: storeProfile.businessDocumentType || 'Not specified',
        contactPhone: storeProfile.sellerPhoneNumber || 'Not specified',
        businessPhoneNumber:
          storeProfile.businessPhoneNumber || 'Not specified',
      });
    }

    const storeProfiles = await prisma.sellerProfile.findMany({
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

    const storeData = storeProfiles.map((profile) => {
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
        country,
        businessAddress,
        pickupAddress,
        businessRegisteredName:
          profile.businessRegisteredName || 'Not specified',
        individualRegisteredName:
          profile.individualRegisteredName || 'Not specified',
        phoneNumber: profile.businessPhoneNumber || 'Not specified',
        returnPolicy: profile.returnsTerms || 'Not specified',
        shippingPolicy: profile.shippingTerms || 'Not specified',
        contactEmail: profile.sellerEmail || 'Not specified',
        contactPhone: profile.sellerPhoneNumber || 'Not specified',
      };
    });

    return NextResponse.json(storeData, { status: 200 });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { storeId, isVerified, storeStatus } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    const updatedStore = await prisma.sellerProfile.update({
      where: { id: storeId },
      data: {
        isVerified,
        storeStatus,
        updatedAt: new Date(),
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
      },
    });

    return NextResponse.json(updatedStore, { status: 200 });
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}
