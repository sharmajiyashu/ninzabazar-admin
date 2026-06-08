import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] ?? 'admin@gmail.com';
  const password = process.argv[3] ?? 'Admin@123';

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    console.log(`No admin found for username: ${username}`);
    return;
  }

  const valid = await bcrypt.compare(password, admin.password);
  console.log(`Username: ${username}`);
  console.log(`Password "${password}" valid:`, valid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
