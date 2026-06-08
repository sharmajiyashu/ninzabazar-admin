import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

config({ path: '.env' });

const prisma = new PrismaClient();

const USERNAME = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';

async function main() {
  const existing = await prisma.admin.findUnique({ where: { username: USERNAME } });

  if (existing) {
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    await prisma.admin.update({
      where: { username: USERNAME },
      data: { password: hashedPassword },
    });
    console.log(`Updated password for existing admin: ${USERNAME}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  await prisma.admin.create({
    data: { username: USERNAME, password: hashedPassword },
  });
  console.log(`Created admin: ${USERNAME}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
