import { Request, Response, NextFunction } from "express";
import { cartService } from "../service/cart-service";
import { ErroApi } from "../exeptions/error-api";
import { tokenService } from "../service/token-service";

class Cart {
  // нужно реализовать чтобы была корзина без регистрации?
  // тогда нужно проверять авторизован ли пользователь если нет, то назначать id-ку(видимо временную)

  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
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

      if (isNaN(userId)) {
        return res.status(400).json({ error: "id пользователя не валидный" });
      }

      const cart = await cartService.getCart(userId);

      if (!cart) {
        return res.status(404).json({ error: "Не удалось найти корзину" });
      }

      const response = {
        id: cart.id,
        userId: cart.userId,
        totalAmount: cart.totalAmount,
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.productItem.product.id,
            name: item.productItem.product.name,
            imageUrl: item.productItem.product.imageUrl,
            description: item.productItem.product.description,
            price: item.productItem.product.price,
            size: item.productItem.size,
          },
        })),
      };

      return res.json(response);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addProductInCart(req: Request, res: Response, next: NextFunction) {
    try {
      // достаю id пользователя из JWT, наверное, стоит написать функцию которая будет это делать
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

      const productId = parseInt(req.params.id as string);

      const quantity = parseInt(req.body.quantity) || 1;

      if (isNaN(productId)) {
        throw ErroApi.BadRequestError("Некорректный ID товара");
      }

      const cartItem = await cartService.addProductInCart(
        userId,
        productId,
        quantity,
      );

      return res.json({
        success: true,
        data: cartItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProductInCart(req: Request, res: Response, next: NextFunction) {
    try {
      // достаю id пользователя из JWT, наверное, стоит написать функцию которая будет это делать

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

      const { id } = req.body;
      console.log("removeProductInCart id = " + id);

      const result = await cartService.removeProductInCart(userId, Number(id));

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

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
