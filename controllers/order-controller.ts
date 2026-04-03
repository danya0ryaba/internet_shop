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

      if (!userId) {
        throw ErroApi.BadRequestError("Авторизуйтесь на сайте");
      }

      const order = await orderService.createOrder(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Заказ успешно создан",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async showOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getIdFromJWT(req, res, next);

      if (!userId) {
        throw ErroApi.BadRequestError("Авторизуйтесь на сайте");
      }

      const orders = await orderService.showOrder(userId);

      return res.status(201).json({
        success: true,
        message: "Ваши заказы",
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();

// Пример данны, которые нужны для заказа!
// {
//   "phone": "79771221299",
//   "address": "solik",
//   "comment": "comment",
//   "email": "s3p7e@sharebot.net",
//   "fullName": "fullName",
//   "paymentId": "string",
//   "status": "PENDING",
//   "totalAmount": 2000,
//   "token": "123",
//   "items": [{
//     "productItemId": 5, // самого продукта productItem
//     "quantity": 1
//   }]
// }
