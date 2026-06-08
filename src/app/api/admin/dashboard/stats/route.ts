import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ROUTES } from '@/constants/routes';
import type { DashboardStats } from '@/types/dashboard';

const CHART_COLORS = {
  green: '#16a34a',
  blue: '#2563eb',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#64748b',
  purple: '#7c3aed',
};

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    const [
      totalUsers,
      totalOrders,
      pendingProducts,
      pendingStores,
      pendingQueries,
      recentOrders,
      storeGroups,
      productGroups,
      queryGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count({
        where: {
          OR: [{ adminApproved: false }, { status: { in: ['pending', 'under review'] } }],
        },
      }),
      prisma.sellerProfile.count({
        where: {
          NOT: {
            storeStatus: { in: ['approved', 'APPROVED', 'rejected', 'REJECTED'] },
          },
        },
      }),
      prisma.customerQuery.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.sellerProfile.groupBy({
        by: ['storeStatus'],
        _count: { storeStatus: true },
      }),
      prisma.product.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.customerQuery.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const dayBuckets = Array.from({ length: 7 }, (_, index) => {
      const date = startOfDay(new Date(sevenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000));
      return {
        key: date.toISOString().slice(0, 10),
        date: formatDay(date),
        orders: 0,
        revenue: 0,
      };
    });

    const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));

    for (const order of recentOrders) {
      const key = startOfDay(order.createdAt).toISOString().slice(0, 10);
      const bucket = bucketMap.get(key);
      if (bucket) {
        bucket.orders += 1;
        bucket.revenue += Number(order.totalAmount);
      }
    }

    const stats: DashboardStats = {
      summary: [
        { label: 'Total Users', value: totalUsers, href: ROUTES.users, tone: 'blue' },
        { label: 'Total Orders', value: totalOrders, href: ROUTES.orders, tone: 'green' },
        { label: 'Products Pending', value: pendingProducts, href: ROUTES.products, tone: 'amber' },
        { label: 'Stores Pending', value: pendingStores, href: ROUTES.stores, tone: 'rose' },
        { label: 'Open Queries', value: pendingQueries, href: ROUTES.queries, tone: 'blue' },
      ],
      ordersTrend: dayBuckets.map(({ date, orders, revenue }) => ({ date, orders, revenue })),
      storeStatus: storeGroups.map((group, index) => ({
        name: String(group.storeStatus ?? 'Unknown'),
        value: group._count.storeStatus,
        fill: [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.rose, CHART_COLORS.slate][index % 4],
      })),
      productStatus: productGroups.map((group, index) => ({
        name: String(group.status ?? 'Unknown'),
        value: group._count.status,
        fill: [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.rose, CHART_COLORS.blue][index % 4],
      })),
      queryStatus: queryGroups.map((group, index) => ({
        name: String(group.status ?? 'Unknown'),
        value: group._count.status,
        fill: [CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.slate][index % 4],
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[dashboard/stats] failed:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
