import { Request, Response, NextFunction } from "express";
import { cartService } from "../service/cart-service";

class Cart {
  // нужно реализовать чтобы была корзина без регистрации?
  // тогда нужно проверять авторизован ли пользователь если нет, то назначать id-ку(видимо временную)
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(400).json({ error: "id корзины не валидный" });
      }

      const cart = await cartService.getCart(id);

      if (!cart) {
        return res.status(404).json({ error: "Не удалось найти корзину" });
      }

      return res.json(cart);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addProductInCart(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.id as string);

      if (isNaN(productId)) {
        return res.status(400).json({
          error: "Такого продукта не существует. Невозможно добавить в корзину",
        });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async removeProductInCart(req: Request, res: Response, next: NextFunction) {}

  async makeOnOrder(req: Request, res: Response, next: NextFunction) {}

  async getAllCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const carts = await cartService.getAllCarts();
      return res.json(carts);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

export const cartController = new Cart();
