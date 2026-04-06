import { ErrorApi } from "../exeptions/error-api";
import { prisma } from "../lib/prisma";
import { ProductCreateInput, ProductWithId } from "../types/types";

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

  async getFilterredProducts(categoryName: string) {
    try {
      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
        include: {
          products: true,
        },
      });

      if (!category) {
        throw ErrorApi.BadRequestError("Продукты в этой категория не найдена");
      }

      return category.products;
    } catch (error) {
      console.log(error);
      throw ErrorApi.BadRequestError("Не удалось отфильтровать товары");
    }
  }

  async searchProducts(searchQuery: string) {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          name: "asc",
        },
      });

      return products;
    } catch (error) {
      throw ErrorApi.BadRequestError("Поиск не удался");
    }
  }

  async createProduct(body: ProductCreateInput, categoryName: string) {
    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
      select: {
        id: true,
      },
    });

    if (!category?.id) {
      throw ErrorApi.BadRequestError("Такой категории не существует");
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        imageUrl: body.imageUrl,
        description: body.description,
        price: body.price,
        size: body.size,
        categoryId: category?.id,
      },
    });

    return newProduct;
  }

  async updateProduct(body: ProductWithId) {
    const updateProduct = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        imageUrl: body.imageUrl,
        description: body.description,
        price: body.price,
        size: body.size,
      },
    });

    if (!updateProduct) {
      throw ErrorApi.BadRequestError("Ошибка при обновлении продукта");
    }

    return updateProduct;
  }

  async deleteProduct(id: number) {
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    return deletedProduct;
  }
}

export const productService = new ProductService();
