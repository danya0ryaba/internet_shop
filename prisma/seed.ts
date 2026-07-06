import * as bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.productImage.deleteMany(); // <--- ДОБАВЛЕНО
  await prisma.token.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storyItem.deleteMany();
  await prisma.story.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();

  // Создаем категории
  const categoriesData = [
    { name: "Овощи" },
    { name: "Цветы" },
    { name: "Зелень и травы" },
    { name: "Грибы" },
    { name: "Ягоды" },
    { name: "Другое" },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) => prisma.category.create({ data: cat })),
  );

  // Создаем пользователей
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

  console.log("Пользователи созданы:", { adminUser, regularUser });

  // Получим ID категорий по имени
  const categoryMap = categories.reduce(
    (acc, cat) => {
      acc[cat.name] = cat.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Создаем продукты
  const productsData = [
    {
      name: "Свежие огурцы",
      description: "Свежие огурцы, выращенные в домашних условиях.",
      price: 50,
      size: null,
      categoryId: categoryMap["Овощи"],
      items: [
        { price: 50, size: null },
        { price: 60, size: null },
      ],
    },
    {
      name: "Розы букет",
      description: "Красивый букет из свежих роз.",
      price: 300,
      size: null,
      categoryId: categoryMap["Цветы"],
      items: [
        { price: 300, size: null },
        { price: 350, size: null },
      ],
    },
    {
      name: "Мята",
      description: "Ароматная свежая мята для чая или десертов.",
      price: 20,
      size: null,
      categoryId: categoryMap["Зелень и травы"],
      items: [
        { price: 20, size: null },
        { price: 25, size: null },
      ],
    },
    {
      name: "Лесные грибы",
      description: "Свежие лесные грибы, собранные вручную.",
      price: 150,
      size: null,
      categoryId: categoryMap["Грибы"],
      items: [
        { price: 150, size: null },
        { price: 180, size: null },
      ],
    },
    {
      name: "Клубника",
      description: "Сладкая домашняя клубника.",
      price: 100,
      size: null,
      categoryId: categoryMap["Ягоды"],
      items: [
        { price: 100, size: null },
        { price: 120, size: null },
      ],
    },
  ];

  for (const productData of productsData) {
    await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        size: productData.size,
        deliveryToCities: true,
        category: {
          connect: { id: productData.categoryId },
        },
        items: {
          create: productData.items,
        },
        images: {
          create: [
            { url: "/uploads/images/test1.jpg" },
            { url: "/uploads/images/test2.jpg" },
            { url: "/uploads/images/test3.jpg" },
            { url: "/uploads/images/test4.jpg" },
          ],
        },
      },
    });
  }

  console.log("Данные успешно созданы");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
