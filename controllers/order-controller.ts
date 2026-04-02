import { Request, Response, NextFunction } from "express";
import { orderService } from "../service/order-service";
import { ErroApi } from "../exeptions/error-api";
import { IOrder } from "../types/types";
import { getIdFromJWT } from "../lib/getIdFromJwt";
import { prisma } from "../lib/prisma";

class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        phone,
        fullName,
        address,
        totalAmount,
        status,
        token,
        items,
      } = req.body as IOrder;

      // Валидация обязательных полей
      if (
        !phone ||
        !address ||
        !email ||
        !fullName ||
        !items ||
        !token ||
        !totalAmount ||
        !status
      ) {
        throw ErroApi.BadRequestError(
          "Не все данные переданы для оформления заказа",
        );
      }

      const userId = getIdFromJWT(req, res, next);

      // 1. Найти корзину по userId (если пользователь авторизован)
      let cart;
      if (userId) {
        cart = await prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                productItem: true, // ← ВАЖНО: загружаем ProductItem для получения цены и размера
              },
            },
          },
        });
      } else {
        // Если неавторизованный — ищем по token
        // cart = await prisma.cart.findUnique({
        //   where: { token },
        //   include: {
        //     items: {
        //       include: {
        //         productItem: true, // ← ВАЖНО: загружаем ProductItem
        //       },
        //     },
        //   },
        // });
      }

      if (!cart) {
        throw ErroApi.BadRequestError("Корзина не найдена");
      }

      // 2. Проверить, что все productItemId в items существуют в корзине
      const cartItemIds = cart.items.map((ci) => ci.productItemId);
      const invalidItems = items.filter(
        (item) => !cartItemIds.includes(item.productItemId),
      );

      if (invalidItems.length > 0) {
        throw ErroApi.BadRequestError(
          `Некоторые товары в заказе не существуют в корзине: ${invalidItems.map((i) => i.productItemId).join(", ")}`,
        );
      }

      // 3. Проверить, что количество товара в корзине не меньше запрошенного
      for (const item of items) {
        const cartItem = cart.items.find(
          (ci) => ci.productItemId === item.productItemId,
        );
        if (!cartItem || cartItem.quantity < item.quantity) {
          throw ErroApi.BadRequestError(
            `Недостаточно товара в корзине: productItemId ${item.productItemId}`,
          );
        }
      }

      // 4. Создать заказ — используем данные из ProductItem (из БД), а не из входных данных
      const order = await prisma.order.create({
        data: {
          token,
          totalAmount,
          status,
          email,
          phone,
          fullName,
          address,
          userId: userId || undefined, // если есть — привязываем
          items: {
            create: items.map((item) => {
              const cartItem = cart.items.find(
                (ci: any) => ci.productItemId === item.productItemId,
              );
              if (!cartItem?.productItem) {
                throw new Error(
                  `ProductItem с id ${item.productItemId} не найден в базе`,
                );
              }

              const { price, size } = cartItem.productItem;

              return {
                productItem: {
                  connect: { id: item.productItemId },
                },
                quantity: item.quantity,
                price: price, // ← Берём цену из БД — фиксируем на момент заказа
                size: size?.toString() || null, // ← Берём размер из БД
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              productItem: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // 5. Удалить все элементы корзины
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 6. Сбросить totalAmount корзины
      await prisma.cart.update({
        where: { id: cart.id },
        data: { totalAmount: 0 },
      });

      // 7. (Опционально) Сгенерировать новый токен для корзины
      // const newCartToken =
      //   Math.random().toString(36).substring(2, 15) +
      //   Math.random().toString(36).substring(2, 15);
      // await prisma.cart.update({
      //   where: { id: cart.id },
      //   data: { token: newCartToken },
      // });

      return res.status(201).json({
        success: true,
        message: "Заказ успешно создан",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
