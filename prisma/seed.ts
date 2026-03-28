import * as bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  // 1. Очистка базы (опционально)
  await prisma.cartItem.deleteMany();
  await prisma.productItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.token.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  // 2. Создание категорий
  const categories = await prisma.category.createMany({
    data: [
      { name: "Овощи" },
      { name: "Цветы" },
      { name: "Зелень и травы" },
      { name: "Грибы" },
      { name: "Ягоды" },
      { name: "Другое" },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${categories.count} categories`);

  // 3. Создание пользователей
  const passwordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      fullName: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
      isActivated: true,
      verified: new Date(),
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      fullName: "Regular User",
      email: "user@example.com",
      password: passwordHash,
      role: "USER",
      isActivated: true,
      verified: new Date(),
    },
  });

  console.log("Created users:", { adminUser, regularUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
