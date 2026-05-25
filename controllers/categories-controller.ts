import { Request, Response, NextFunction } from "express";
import { categoriesService } from "../service/categories-service";

class CategoriesController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("CategoriesController");
      const categories = await categoriesService.getAllCategoriesWithProducts();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
}
export const categoriesController = new CategoriesController();
