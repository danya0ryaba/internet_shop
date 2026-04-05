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
            console.log("item = ");
            console.log(item);
            const cartItem = cart.items.find((ci: any) => {
              console.log("ci.productItemId = ");
              console.log(ci.productItemId);
              return ci.productItemId === item.productItemId;
            });
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
