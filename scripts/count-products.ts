import prisma from '../src/lib/prisma';

async function main() {
  const c1 = await prisma.product.count({ where: { status: 'approved', isActive: true } });
  const c2 = await prisma.product.count({ where: { status: 'approved' } });
  const c3 = await prisma.product.count();
  const groups = await prisma.product.groupBy({ by: ['status'], _count: true });
  console.log('by status', groups);
  const adminApproved = await prisma.product.count({ where: { adminApproved: true } });
  const liveApproved = await prisma.product.count({ where: { status: 'approved', isActive: true } });
  const liveActive = await prisma.product.count({ where: { status: 'active', isActive: true } });
  const liveEither = await prisma.product.count({
    where: { isActive: true, status: { in: ['approved', 'active'] } },
  });
  console.log('live approved', liveApproved, 'live active-status', liveActive, 'live either', liveEither);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
