import { Request, Response, NextFunction } from "express";
import { cartService } from "../service/cart-service";
import { ErrorApi } from "../exeptions/error-api";
import { getIdFromJWT } from "../lib/getIdFromJwt";

class Cart {
  // нужно реализовать чтобы была корзина без регистрации?
  // тогда нужно проверять авторизован ли пользователь если нет, то назначать id-ку(видимо временную)

  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getIdFromJWT(req, res, next);

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
          selected: item.selected ?? false,
          product: {
            id: item.productItem.product.id,
            name: item.productItem.product.name,
            description: item.productItem.product.description,
            price: item.productItem.product.price,
            size: item.productItem.size,

            images: item.productItem.product.images.map((img) => ({
              id: img.id,
              url: img.url,
            })),
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
      const userId = getIdFromJWT(req, res, next);

      const productId = parseInt(req.params.id as string);

      // const quantity = parseInt(req.body.quantity) || 1;
      const quantity = 1;

      if (isNaN(productId)) {
        throw ErrorApi.BadRequestError("Некорректный ID товара");
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
      const userId = getIdFromJWT(req, res, next);

      const { id } = req.body;

      const result = await cartService.removeProductInCart(userId, Number(id));

      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const carts = await cartService.getAllCarts();
      return res.json(carts);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async selectProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getIdFromJWT(req, res, next);
      const { id } = req.body;
      const selectProduct = await cartService.selectProduct(userId, id);
      return res.json(selectProduct);
    } catch (error) {
      next(error);
    }
  }

  async changeQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getIdFromJWT(req, res, next);
      const { id, delta } = req.body as { id: number; delta: number };

      const updated = await cartService.changeQuantity(
        userId,
        Number(id),
        Number(delta),
      );
      return res.json({ success: true, data: updated });
    } catch (e) {
      next(e);
    }
  }
}

export const cartController = new Cart();
