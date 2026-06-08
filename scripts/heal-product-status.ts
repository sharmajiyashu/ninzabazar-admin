import prisma from '../src/lib/prisma';

/** One-time heal: legacy seed used status "active" instead of "approved". */
async function main() {
  const result = await prisma.product.updateMany({
    where: {
      status: 'active',
      adminApproved: true,
    },
    data: {
      status: 'approved',
    },
  });
  console.log(`Updated ${result.count} products from status "active" to "approved".`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
