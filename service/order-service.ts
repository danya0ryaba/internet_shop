import { ErrorApi } from "../exeptions/error-api";
import { OrderStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { OrderBody } from "../types/types";

class OrderService {
  async createOrder(userId: number, dto: OrderBody) {
    // 1. Корзина + только выбранные товары
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: dto.selectedCartItemIds?.length
            ? { id: { in: dto.selectedCartItemIds } }
            : { selected: true }, // по-умолчанию
          include: { productItem: { include: { product: true } } },
        },
      },
    });

    if (!cart) throw ErrorApi.BadRequestError("Корзина не найдена");
    if (!cart.items.length)
      throw ErrorApi.BadRequestError("Нет выбранных товаров");

    // 2. Данные для OrderItem
    const orderItemsData = cart.items.map((ci) => ({
      productItem: { connect: { id: ci.productItemId } },
      quantity: ci.quantity,
      price: ci.productItem.price,
      size: ci.productItem.size ? Number(ci.productItem.size) : undefined,
    }));

    const totalAmount = orderItemsData.reduce(
      (s, i) => s + i.price * i.quantity,
      0,
    );

    // 3. Создаём заказ
    const order = await prisma.order.create({
      data: {
        userId,
        token: dto.token,
        totalAmount,
        status: OrderStatus.PENDING,
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        address: dto.address,
        comment: dto.comment || null,
        paymentId: dto.paymentId || null,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { productItem: { include: { product: true } } } },
      },
    });

    // 4. Удаляем только купленные позиции
    await prisma.cartItem.deleteMany({
      where: { id: { in: cart.items.map((i) => i.id) } },
    });

    // 5. Пересчёт totalAmount корзины (остались только невыбранные)
    const remaining = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount: remaining._sum.quantity ?? 0 },
    });

    return order;
  }

  async showOrder(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true }, // чтобы вернуть имя, изображение и т.д.
            },
          },
        },
      },
    });
  }

  async allOrders() {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            productItem: {
              include: {
                product: {
                  // что именно заказали
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return orders;
  }
}

export const orderService = new OrderService();
