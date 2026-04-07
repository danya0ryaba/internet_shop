import { Request, Response, NextFunction } from "express";
import { orderService } from "../service/order-service";
import { ErrorApi } from "../exeptions/error-api";
import { IOrder } from "../types/types";
import { getIdFromJWT } from "../lib/getIdFromJwt";
import { prisma } from "../lib/prisma";

class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
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
