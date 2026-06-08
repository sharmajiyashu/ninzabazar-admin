import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, createdAt: true },
  });
  console.log('Admins in database:', JSON.stringify(admins, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
