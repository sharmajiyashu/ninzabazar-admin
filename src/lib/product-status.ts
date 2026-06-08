import type { Prisma } from '@prisma/client'

export type ProductReviewStatus = 'pending' | 'approved' | 'rejected'

export function resolveReviewStatus(
  status: string,
  adminApproved?: boolean
): ProductReviewStatus {
  if (status === 'rejected') return 'rejected'
  if (
    status === 'approved' ||
    (status === 'active' && adminApproved) ||
    adminApproved
  ) {
    return 'approved'
  }
  return 'pending'
}

export function isProductApproved(
  status: string,
  adminApproved?: boolean
): boolean {
  return resolveReviewStatus(status, adminApproved) === 'approved'
}

export function isProductLiveOnStore(
  status: string,
  adminApproved: boolean | undefined,
  isActive: boolean
): boolean {
  return isProductApproved(status, adminApproved) && isActive
}

export function liveProductWhere(): Prisma.ProductWhereInput {
  return {
    isActive: true,
    OR: [
      { status: 'approved' },
      { status: 'active', adminApproved: true },
    ],
  }
}

export function approvedReviewWhere(): Prisma.ProductWhereInput {
  return {
    OR: [
      { status: 'approved' },
      { status: 'active', adminApproved: true },
      {
        adminApproved: true,
        status: { notIn: ['rejected', 'pending', 'under review'] },
      },
    ],
    NOT: { status: 'rejected' },
  }
}

export function getReviewStatusLabel(status: ProductReviewStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Pending Review'
  }
}

export function getListingLabel(
  reviewStatus: ProductReviewStatus,
  isActive: boolean
): string {
  if (reviewStatus === 'pending') return 'Awaiting Review'
  if (reviewStatus === 'rejected') return 'Cannot List'
  return isActive ? 'Live' : 'Hidden'
}
