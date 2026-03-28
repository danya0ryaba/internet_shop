import { ErroApi } from "../exeptions/error-api";
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

  // на все эти операции повесить middleware чтобы проверял что это делает ADMIN
  async createProduct(body: ProductCreateInput, categoryName: string) {
    // Найди категорию по ее названию
    const category = await prisma.category.findUnique({
      where: {
        name: categoryName,
      },
      select: {
        id: true,
      },
    });

    if (!category?.id) {
      throw ErroApi.BadRequestError("Такой категории не существует");
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
      throw ErroApi.BadRequestError("Ошибка при обновлении продукта");
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
