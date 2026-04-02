import { prisma } from "../lib/prisma";
import { IOrder } from "../types/types";

class OrderService {
  async createOrder(data: IOrder) {}
}

export const orderService = new OrderService();
