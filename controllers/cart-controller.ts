import { Request, Response, NextFunction } from "express";
import { cartService } from "../service/cart-service";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

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
      // достаю id пользователя из JWT
      const authorizetionHeader = req.headers.authorization;
      if (!authorizetionHeader) {
        return next(ErroApi.UnauthorizenError());
      }

      const accessToken = authorizetionHeader.split(" ")[1];

      if (!accessToken) {
        return next(ErroApi.UnauthorizenError());
      }

      const user = tokenService.decodeToken(accessToken);

      if (!user) {
        return next(ErroApi.UnauthorizenError());
      }
      const userId = user.id;
      //
      //
      //
      //

      const productItemId = parseInt(req.params.id as string); // тут вытаскиваю id товара из строки запроса
      const quantity = req.body.quantity || 1;

      if (isNaN(productItemId)) {
        throw ErroApi.BadRequestError("Некорректный ID товара");
      }

      const cartItem = await cartService.addProductInCart(
        userId,
        productItemId,
        quantity,
      );

      res.json({
        success: true,
        data: cartItem,
      });
    } catch (error) {
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
