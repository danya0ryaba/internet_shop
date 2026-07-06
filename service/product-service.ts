// // import { ErrorApi } from "../exeptions/error-api";
// // import { Prisma } from "../generated/prisma/client";
// // import { prisma } from "../lib/prisma";
// // import { ProductCreateInput, ProductWithId } from "../types/types";
// // import { deleteFileFromDisk } from "../utils/uploads";

// // class ProductService {
// //   async getAllProducts({ page, limit }: { page: number; limit: number }) {
// //     const [products, totalCount] = await Promise.all([
// //       prisma.product.findMany({
// //         skip: (page - 1) * limit,
// //         take: limit,
// //         include: { category: true, images: true },
// //         orderBy: { id: "desc" },
// //       }),
// //       prisma.product.count(),
// //     ]);
// //     return { products, totalCount };
// //   }

// //   async getProductById(id: number) {
// //     const product = await prisma.product.findUnique({
// //       where: { id: Number(id) },
// //       include: {
// //         category: true,
// //         items: true,
// //         images: true,
// //       },
// //     });
// //     return product;
// //   }

// //   async getFilterredProducts(categoryName: string) {
// //     try {
// //       const products = await prisma.product.findMany({
// //         where: {
// //           category: {
// //             name: {
// //               equals: categoryName,
// //               mode: "insensitive",
// //             },
// //           },
// //         },
// //         include: {
// //           items: true,
// //           category: true,
// //           images: true,
// //         },
// //       });

// //       if (!products.length) {
// //         throw ErrorApi.BadRequestError("Продукты в этой категории не найдены");
// //       }

// //       return products;
// //     } catch (error) {
// //       console.log(error);
// //       throw ErrorApi.BadRequestError("Не удалось отфильтровать товары");
// //     }
// //   }

// //   async searchProducts(searchQuery: string) {
// //     try {
// //       const products = await prisma.product.findMany({
// //         where: {
// //           OR: [
// //             {
// //               name: {
// //                 contains: searchQuery,
// //                 mode: "insensitive",
// //               },
// //             },
// //             {
// //               description: {
// //                 contains: searchQuery,
// //                 mode: "insensitive",
// //               },
// //             },
// //           ],
// //         },
// //         orderBy: {
// //           name: "asc",
// //         },
// //       });

// //       return products;
// //     } catch (error) {
// //       throw ErrorApi.BadRequestError("Поиск не удался");
// //     }
// //   }

// //   async createProduct(
// //     body: ProductCreateInput,
// //     categoryName: string,
// //     images: string[],
// //   ) {
// //     const category = await prisma.category.findUnique({
// //       where: { name: categoryName },
// //       select: { id: true },
// //     });

// //     if (!category?.id) {
// //       for (const url of images) await deleteFileFromDisk(url);
// //       throw ErrorApi.BadRequestError("Такой категории не существует");
// //     }

// //     const newProduct = await prisma.product.create({
// //       data: {
// //         name: body.name,
// //         description: body.description,
// //         price: body.price,
// //         size: body.size ?? null,
// //         unit: body.unit ?? "шт",
// //         categoryId: category.id,
// //         items: {
// //           create: [{ price: body.price, size: body.size ?? null }],
// //         },
// //         images: {
// //           create: images.map((url) => ({ url })),
// //         },
// //       },
// //       include: {
// //         items: true,
// //         category: true,
// //         images: true,
// //       },
// //     });

// //     return newProduct;
// //   }

// //   async updateProduct(body: Partial<ProductWithId>) {
// //     if (!body.id) {
// //       throw ErrorApi.BadRequestError("Отсутствует ID товара");
// //     }

// //     const updateData: Partial<Prisma.ProductUpdateInput> = {};
// //     if (body.name !== undefined) updateData.name = body.name;
// //     if (body.description !== undefined)
// //       updateData.description = body.description;
// //     if (body.price !== undefined) updateData.price = body.price;
// //     if (body.size !== undefined) updateData.size = body.size;
// //     if (body.quantityProduct !== undefined) {
// //       updateData.quantityProduct = body.quantityProduct;
// //     }

// //     const updateProduct = await prisma.product.update({
// //       where: { id: body.id },
// //       data: updateData,
// //     });

// //     if (!updateProduct) {
// //       throw ErrorApi.BadRequestError("Ошибка при обновлении продукта");
// //     }

// //     return updateProduct;
// //   }

// //   async deleteProduct(id: number) {
// //     const product = await prisma.product.findUnique({
// //       where: { id },
// //       include: {
// //         images: true,
// //         items: true,
// //       },
// //     });

// //     if (!product) throw ErrorApi.BadRequestError("Товар не найден");

// //     for (const image of product.images) {
// //       await deleteFileFromDisk(image.url);
// //     }

// //     const deletedProduct = await prisma.$transaction(async (tx) => {
// //       await tx.cartItem.deleteMany({
// //         where: {
// //           productItem: {
// //             productId: id,
// //           },
// //         },
// //       });

// //       await tx.orderItem.deleteMany({
// //         where: {
// //           productItem: {
// //             productId: id,
// //           },
// //         },
// //       });

// //       await tx.productItem.deleteMany({
// //         where: { productId: id },
// //       });

// //       await tx.productImage.deleteMany({
// //         where: { productId: id },
// //       });

// //       return tx.product.delete({
// //         where: { id },
// //       });
// //     });

// //     return deletedProduct;
// //   }
// // }

// // export const productService = new ProductService();

// import { ErrorApi } from "../exeptions/error-api";
// import { Prisma } from "../generated/prisma/client";
// import { prisma } from "../lib/prisma";
// import { ProductCreateInput, ProductWithId } from "../types/types";
// import { deleteFileFromDisk } from "../utils/uploads";

// class ProductService {
//   async getAllProducts({ page, limit }: { page: number; limit: number }) {
//     const [products, totalCount] = await Promise.all([
//       prisma.product.findMany({
//         skip: (page - 1) * limit,
//         take: limit,
//         include: { category: true, images: true },
//         orderBy: { id: "desc" },
//       }),
//       prisma.product.count(),
//     ]);
//     return { products, totalCount };
//   }

//   async getProductById(id: number) {
//     const product = await prisma.product.findUnique({
//       where: { id: Number(id) },
//       include: {
//         category: true,
//         items: true,
//         images: true,
//       },
//     });
//     return product;
//   }

//   async getFilterredProducts(categoryName: string) {
//     try {
//       const products = await prisma.product.findMany({
//         where: {
//           category: {
//             name: {
//               equals: categoryName,
//               mode: "insensitive",
//             },
//           },
//         },
//         include: {
//           items: true,
//           category: true,
//           images: true,
//         },
//       });

//       if (!products.length) {
//         throw ErrorApi.BadRequestError("Продукты в этой категории не найдены");
//       }

//       return products;
//     } catch (error) {
//       console.log(error);
//       throw ErrorApi.BadRequestError("Не удалось отфильтровать товары");
//     }
//   }

//   async searchProducts(searchQuery: string) {
//     try {
//       const products = await prisma.product.findMany({
//         where: {
//           OR: [
//             {
//               name: {
//                 contains: searchQuery,
//                 mode: "insensitive",
//               },
//             },
//             {
//               description: {
//                 contains: searchQuery,
//                 mode: "insensitive",
//               },
//             },
//           ],
//         },
//         orderBy: {
//           name: "asc",
//         },
//       });

//       return products;
//     } catch (error) {
//       throw ErrorApi.BadRequestError("Поиск не удался");
//     }
//   }

//   async createProduct(
//     body: ProductCreateInput,
//     categoryName: string,
//     images: string[],
//   ) {
//     const category = await prisma.category.findUnique({
//       where: { name: categoryName },
//       select: { id: true },
//     });

//     if (!category?.id) {
//       for (const url of images) await deleteFileFromDisk(url);
//       throw ErrorApi.BadRequestError("Такой категории не существует");
//     }

//     const newProduct = await prisma.product.create({
//       data: {
//         name: body.name,
//         description: body.description,
//         price: body.price,
//         size: body.size ?? null,
//         unit: body.unit ?? "шт",
//         quantityProduct: body.quantityProduct ?? 1,
//         deliveryToCities: body.deliveryToCities ?? false,
//         categoryId: category.id,
//         items: {
//           create: [{ price: body.price, size: body.size ?? null }],
//         },
//         images: {
//           create: images.map((url) => ({ url })),
//         },
//       },
//       include: {
//         items: true,
//         category: true,
//         images: true,
//       },
//     });

//     return newProduct;
//   }

//   async updateProduct(body: Partial<ProductWithId>) {
//     if (!body.id) {
//       throw ErrorApi.BadRequestError("Отсутствует ID товара");
//     }

//     const updateData: Partial<Prisma.ProductUpdateInput> = {};
//     if (body.name !== undefined) updateData.name = body.name;
//     if (body.description !== undefined)
//       updateData.description = body.description;
//     if (body.price !== undefined) updateData.price = body.price;
//     if (body.size !== undefined) updateData.size = body.size;
//     if (body.quantityProduct !== undefined) {
//       updateData.quantityProduct = body.quantityProduct;
//     }
//     if (body.deliveryToCities !== undefined) {
//       updateData.deliveryToCities = body.deliveryToCities;
//     }

//     const updateProduct = await prisma.product.update({
//       where: { id: body.id },
//       data: updateData,
//     });

//     if (!updateProduct) {
//       throw ErrorApi.BadRequestError("Ошибка при обновлении продукта");
//     }

//     return updateProduct;
//   }

//   async deleteProduct(id: number) {
//     const product = await prisma.product.findUnique({
//       where: { id },
//       include: {
//         images: true,
//         items: true,
//       },
//     });

//     if (!product) throw ErrorApi.BadRequestError("Товар не найден");

//     for (const image of product.images) {
//       await deleteFileFromDisk(image.url);
//     }

//     const deletedProduct = await prisma.$transaction(async (tx) => {
//       await tx.cartItem.deleteMany({
//         where: {
//           productItem: {
//             productId: id,
//           },
//         },
//       });

//       await tx.orderItem.deleteMany({
//         where: {
//           productItem: {
//             productId: id,
//           },
//         },
//       });

//       await tx.productItem.deleteMany({
//         where: { productId: id },
//       });

//       await tx.productImage.deleteMany({
//         where: { productId: id },
//       });

//       return tx.product.delete({
//         where: { id },
//       });
//     });

//     return deletedProduct;
//   }
// }

// export const productService = new ProductService();

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
    images: string[],
  ) {
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
      select: { id: true },
    });

    if (!category?.id) {
      for (const url of images) await deleteFileFromDisk(url);
      throw ErrorApi.BadRequestError("Такой категории не существует");
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        size: body.size ?? null,
        unit: body.unit ?? "шт",
        quantityProduct: body.quantityProduct ?? 1,
        deliveryToCities: body.deliveryToCities ?? false,
        categoryId: category.id,
        items: {
          create: [{ price: body.price, size: body.size ?? null }],
        },
        images: {
          create: images.map((url) => ({ url })),
        },
      },
      include: {
        items: true,
        category: true,
        images: true,
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
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.quantityProduct !== undefined) {
      updateData.quantityProduct = body.quantityProduct;
    }
    if (body.deliveryToCities !== undefined) {
      updateData.deliveryToCities = body.deliveryToCities;
    }

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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        items: true,
      },
    });

    if (!product) throw ErrorApi.BadRequestError("Товар не найден");

    for (const image of product.images) {
      await deleteFileFromDisk(image.url);
    }

    const deletedProduct = await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: {
          productItem: {
            productId: id,
          },
        },
      });

      await tx.orderItem.deleteMany({
        where: {
          productItem: {
            productId: id,
          },
        },
      });

      await tx.productItem.deleteMany({
        where: { productId: id },
      });

      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      return tx.product.delete({
        where: { id },
      });
    });

    return deletedProduct;
  }
}

export const productService = new ProductService();
