import { Request, Response, NextFunction } from "express";
import { productService } from "../service/product-service";
import { prisma } from "../lib/prisma";

interface ProductCreateInput {
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  size?: number;
  categoryId: number; // или строка, если передаете название категории
}

class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getAllProducts();
      return res.json(products);
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

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    // Ошибка Foreign key constraint violated говорит о том, что при попытке вставить новый продукт,
    // связанный с категорией через categoryId, Prisma не может найти такую категорию в базе данных.
    // То есть, в таблице категорий нет записи с id = 1.
    try {
      const { name, imageUrl, description, price, size, categoryId } =
        req.body as ProductCreateInput; // написать тип на продукт

      if (!name || !imageUrl || !description || !price || !categoryId) {
        return res
          .status(400)
          .json({ message: "Все обязательные поля должны быть заполнены" });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          imageUrl,
          description,
          price,
          size,
          categoryId,
        },
      });

      return res.json(newProduct);

      // return res.json(product);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {}

  async deleteProduct(req: Request, res: Response, next: NextFunction) {}
}

export const productController = new ProductController();
