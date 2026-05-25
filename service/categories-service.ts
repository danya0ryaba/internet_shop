import { prisma } from "../lib/prisma";

class CategoriesService {
  async getAllCategoriesWithProducts() {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    console.log("service CategoriesService");
    return categories;
  }
}

export const categoriesService = new CategoriesService();
