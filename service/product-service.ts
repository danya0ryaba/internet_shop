import { prisma } from "../lib/prisma";

class ProductService {
  async getAllProducts() {
    const products = await prisma.product.findMany();
    return products;
  }

  async getProductById(id: number) {
    const product = await prisma.product.findFirst({
      where: { id },
    });
    return product;
  }

  async createProduct(body: any) {
    // const category = await prisma.category.findUnique({
    //   where: { name: body.category },
    // });
    // category не найдена тк, не создана
    // if (!category) {
    //   throw new Error("Category not found");
    // }
    const product = await prisma.product.create({
      data: {
        name: body.name,
        imageUrl: body.imageUrl,
        description: body.description,
        price: body.price,
        size: body.size,
        categoryId: 1,
      },
    });
    console.log("product = " + product);
    // return product;
  }
}

export const productService = new ProductService();
