import { Request, Response, NextFunction } from "express";
import { productService } from "../service/product-service";
import { processImage } from "../utils/uploads";

class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    try {
      const { products, totalCount } = await productService.getAllProducts({
        page,
        limit,
      });
      return res.json({ products, totalCount, page, limit });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.id as string);

      if (isNaN(productId)) {
        return res.status(400).json({ error: "Такого продукта не существует" });
      }

      const product = await productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({ error: "Продукт не найден" });
      }

      return res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async getFilterProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryName } = req.params;
      if (!categoryName) {
        return res.status(400).json({ error: "Такой категории не существует" });
      }
      const filterProduct = await productService.getFilterredProducts(
        String(categoryName),
      );
      return res.json(filterProduct);
    } catch (error) {
      next(error);
    }
  }

  async searchProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.query;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Требуется поисковый запрос" });
      }

      const products = await productService.searchProducts(name);
      return res.json(products);
    } catch (error) {
      next(error);
    }
  }

  // только для ADMIN
  async createProduct(req: Request, res: Response, next: NextFunction) {
    // try {
    //   const { name, imageUrl, description, price, categoryName, unit } =
    //     req.body as ProductCreateInput;
    //   if (
    //     !name ||
    //     !imageUrl ||
    //     !description ||
    //     price === undefined ||
    //     !categoryName ||
    //     !unit
    //   ) {
    //     return res
    //       .status(400)
    //       .json({ message: "Все обязательные поля должны быть заполнены" });
    //   }
    //   const newProduct = await productService.createProduct(
    //     req.body,
    //     categoryName,
    //   );
    //   return res.json(newProduct);
    // } catch (error) {
    //   console.error(error);
    //   next(error);
    // }
    // try {
    //   const { name, description, price, categoryName, unit } = req.body;
    //   const files = req.files as Express.Multer.File[] | undefined;
    //   if (
    //     !name ||
    //     !description ||
    //     price === undefined ||
    //     !categoryName ||
    //     !unit
    //   ) {
    //     return res
    //       .status(400)
    //       .json({ message: "Все обязательные поля должны быть заполнены" });
    //   }
    //   if (!files || files.length === 0) {
    //     return res
    //       .status(400)
    //       .json({ message: "Необходимо загрузить хотя бы одно изображение" });
    //   }
    //   // Обрабатываем все картинки через sharp и получаем массив URL
    //   const imageUrls: string[] = [];
    //   for (const file of files) {
    //     const url = await processImage(file);
    //     imageUrls.push(url);
    //   }
    //   const newProduct = await productService.createProduct(
    //     {
    //       name,
    //       description,
    //       price: Number(price),
    //       unit,
    //       size: req.body.size ? Number(req.body.size) : undefined,
    //     },
    //     categoryName,
    //     imageUrls,
    //   );
    //   return res.status(201).json(newProduct);
    // } catch (error) {
    //   next(error);
    // }

    try {
      // ДОБАВИЛ quantityProduct сюда
      const { name, description, price, categoryName, unit, quantityProduct } =
        req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      if (
        !name ||
        !description ||
        price === undefined ||
        !categoryName ||
        !unit
      ) {
        return res
          .status(400)
          .json({ message: "Все обязательные поля должны быть заполнены" });
      }

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ message: "Необходимо загрузить хотя бы одно изображение" });
      }

      const imageUrls: string[] = [];
      for (const file of files) {
        const url = await processImage(file);
        imageUrls.push(url);
      }

      const newProduct = await productService.createProduct(
        {
          name,
          description,
          price: Number(price),
          unit,
          size: req.body.size ? Number(req.body.size) : undefined,
          // ДОБАВИЛ quantityProduct сюда (если пустое, уйдет undefined, и Prisma поставит 1 по умолчанию)
          quantityProduct: quantityProduct
            ? Number(quantityProduct)
            : undefined,
        },
        categoryName, // Передаем отдельно
        imageUrls,
      );

      return res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const updateProduct = await productService.updateProduct(req.body);
      return res.json(updateProduct);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    // try {
    //   const { id } = req.body;
    //   const idNumber = parseInt(id);
    //   if (idNumber || idNumber === 0) {
    //     const deleteProduct = await productService.deleteProduct(idNumber);
    //     return res.json(deleteProduct);
    //   } else {
    //     return res.json({ message: "Нет такого id для удаления" });
    //   }
    // } catch (error) {
    //   console.log(error);
    //   next(error);
    // }
    try {
      const { id } = req.body;
      const idNumber = parseInt(id);
      if (!idNumber && idNumber !== 0) {
        return res.status(400).json({ message: "Нет такого id для удаления" });
      }

      const deleteProduct = await productService.deleteProduct(idNumber);
      return res.json(deleteProduct);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
