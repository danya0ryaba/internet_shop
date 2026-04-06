import { Request, Response, NextFunction } from "express";
import { orderService } from "../service/order-service";
import { ErrorApi } from "../exeptions/error-api";
import { IOrder } from "../types/types";
import { getIdFromJWT } from "../lib/getIdFromJwt";
import { prisma } from "../lib/prisma";

class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    // try {
    //   const {
    //     email,
    //     phone,
    //     fullName,
    //     address,
    //     totalAmount,
    //     status,
    //     token,
    //     items,
    //   } = req.body as IOrder;

    //   if (
    //     !phone ||
    //     !address ||
    //     !email ||
    //     !fullName ||
    //     !items ||
    //     !token ||
    //     !totalAmount ||
    //     !status
    //   ) {
    //     throw ErrorApi.BadRequestError(
    //       "Не все данные переданы для оформления заказа",
    //     );
    //   }

    //   const userId = getIdFromJWT(req, res, next);

    //   if (!userId) {
    //     throw ErrorApi.BadRequestError("Авторизуйтесь на сайте");
    //   }

    //   const order = await orderService.createOrder(userId, req.body);

    //   return res.status(201).json({
    //     success: true,
    //     message: "Заказ успешно создан",
    //     data: order,
    //   });
    // } catch (error) {
    //   next(error);
    // }

    try {
      const userId = getIdFromJWT(req, res, next);
      if (!userId) throw ErrorApi.UnauthorizenError();

      const { email, phone, fullName, address, comment, paymentId, token } =
        req.body;

      const order = await orderService.createOrder(userId, {
        email,
        phone,
        fullName,
        address,
        comment,
        paymentId,
        token,
      });

      res.status(201).json({
        success: true,
        message: "Заказ успешно создан",
        data: order,
      });
    } catch (e) {
      next(e);
    }
  }

  async showOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getIdFromJWT(req, res, next);

      if (!userId) {
        throw ErrorApi.UnauthorizenError();
      }

      const orders = await orderService.showOrder(userId);

      return res.json({ success: true, message: "Ваши заказы", data: orders });
    } catch (error) {
      next(error);
    }
  }

  async allOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.allOrders();
      return res.json({ success: true, message: "Все заказы", data: orders });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();

// Пример данных, которые нужны для заказа!
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

// то есть создается корзина при регистрации и когда пользователь
// добавляет первый продукт в корзину то, productItem === 1 у следующего productItem === 2 и тд

//     "quantity": 1
//   }]
// }

// {
//   "id": 10,
//   "userId": 18,
//   "totalAmount": 50,
//   "items": [
//     {
//       "id": 31,
//       "quantity": 1,
//       "product": {
//         "id": 10,
//         "name": "Свежие огурцы",
//         "imageUrl": "https://example.com/cucumbers.jpg",
//         "description": "Свежие огурцы, выращенные в домашних условиях.",
//         "price": 50,
//         "size": null
//       }
//     }
//   ]
// }
