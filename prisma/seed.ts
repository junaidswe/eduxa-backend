import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@domain.com" },
    update: {},
    create: {
      first_name: "Super",
      last_name: "Admin",
      email: "admin@domain.com",
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
