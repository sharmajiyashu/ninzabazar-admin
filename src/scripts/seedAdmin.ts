import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load .env from project root
config({ path: ".env" });

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

async function createAdmin() {
  console.log("Creating admin user in Prisma Database...");

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists in database.");
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.admin.create({
    data: {
      username: ADMIN_EMAIL,
      password: hashedPassword,
    },
  });

  console.log("✅ Admin created in Database – UID:", admin.id);
}

createAdmin()
  .then(async () => {
    console.log("Seeder finished");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error creating admin:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
