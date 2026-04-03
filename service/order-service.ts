import { ErroApi } from "../exeptions/error-api";
import { prisma } from "../lib/prisma";
import { IOrder } from "../types/types";

class OrderService {
  async createOrder(
    userId: any,
    {
      token,
      totalAmount,
      status,
      email,
      phone,
      fullName,
      address,
      items,
    }: IOrder,
  ) {
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
    }

    if (!cart) {
      throw ErroApi.BadRequestError("Корзина не найдена");
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
        userId: userId,
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

    return order;
  }

  async showOrder(userId: number) {}
}

export const orderService = new OrderService();
