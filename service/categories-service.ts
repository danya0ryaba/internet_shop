import { prisma } from "../lib/prisma";

class CategoriesService {
  async getAllCategoriesWithProducts() {
    const categories = await prisma.category.findMany();
    return categories;
  }
}

export const categoriesService = new CategoriesService();
