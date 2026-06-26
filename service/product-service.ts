import { ErrorApi } from "../exeptions/error-api";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { ProductCreateInput, ProductWithId } from "../types/types";
import { deleteFileFromDisk } from "../utils/uploads";

class ProductService {
  async getAllProducts({ page, limit }: { page: number; limit: number }) {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, images: true },
        orderBy: { id: "desc" },
      }),
      prisma.product.count(),
    ]);
    return { products, totalCount };
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        items: true,
        images: true,
      },
    });
    return product;
  }

  async getFilterredProducts(categoryName: string) {
    try {
      const products = await prisma.product.findMany({
        where: {
          category: {
            name: {
              equals: categoryName,
              mode: "insensitive",
            },
          },
        },
        include: {
          items: true,
          category: true,
          images: true,
        },
      });

      if (!products.length) {
        throw ErrorApi.BadRequestError("Продукты в этой категории не найдены");
      }

      return products;
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

  async createProduct(
    body: ProductCreateInput,
    categoryName: string,
    imageUrls: string[],
  ) {
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
      select: { id: true },
    });

    if (!category?.id) {
      // Если категория не найдена, нужно удалить уже сохраненные на диск картинки!
      for (const url of imageUrls) await deleteFileFromDisk(url);
      throw ErrorApi.BadRequestError("Такой категории не существует");
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        size: body.size ?? null,
        unit: body.unit ?? "шт",
        categoryId: category.id,
        items: {
          create: [{ price: body.price, size: body.size ?? null }],
        },
        images: {
          // Создаем записи о картинках в БД
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        items: true,
        category: true,
        images: true, // Возвращаем картинки клиенту
      },
    });

    return newProduct;
  }

  async updateProduct(body: Partial<ProductWithId>) {
    if (!body.id) {
      throw ErrorApi.BadRequestError("Отсутствует ID товара");
    }

    const updateData: Partial<Prisma.ProductUpdateInput> = {};
    if (body.name !== undefined) updateData.name = body.name;
    // if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.quantityProduct !== undefined)
      updateData.quantityProduct = body.quantityProduct;

    const updateProduct = await prisma.product.update({
      where: { id: body.id },
      data: updateData,
    });

    if (!updateProduct) {
      throw ErrorApi.BadRequestError("Ошибка при обновлении продукта");
    }

    return updateProduct;
  }

  async deleteProduct(id: number) {
    // 1. Находим товар и его картинки, чтобы удалить файлы с диска
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw ErrorApi.BadRequestError("Товар не найден");

    // 2. Удаляем файлы физически с сервера
    for (const image of product.images) {
      await deleteFileFromDisk(image.url);
    }

    // 3. Удаляем товар из БД (картинки удалятся каскадно благодаря схеме Prisma)
    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    return deletedProduct;
  }
}

export const productService = new ProductService();
