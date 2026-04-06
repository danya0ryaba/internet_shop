import { ErrorApi } from "../exeptions/error-api";
import { OrderStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { IOrder } from "../types/types";

type OrderBody = {
  email: string;
  phone: string;
  fullName: string;
  address: string;
  comment?: string;
  paymentId?: string;
  token: string;
  selectedCartItemIds?: number[];
};

class OrderService {
  // async createOrder(
  //   userId: number,
  //   {
  //     token,
  //     totalAmount,
  //     status,
  //     email,
  //     phone,
  //     fullName,
  //     address,
  //     items,
  //   }: IOrder,
  // ) {
  //   let cart;
  //   if (userId) {
  //     cart = await prisma.cart.findUnique({
  //       where: { userId },
  //       include: {
  //         items: {
  //           include: {
  //             productItem: true, // ← ВАЖНО: загружаем ProductItem для получения цены и размера
  //           },
  //         },
  //       },
  //     });
  //   }

  //   if (!cart) {
  //     throw ErrorApi.BadRequestError("Корзина не найдена");
  //   }

  //   // 4. Создать заказ — используем данные из ProductItem (из БД), а не из входных данных
  //   const order = await prisma.order.create({
  //     data: {
  //       token,
  //       totalAmount,
  //       status,
  //       email,
  //       phone,
  //       fullName,
  //       address,
  //       userId: userId,
  //       items: {
  //         create: items.map((item) => {
  //           console.log("item = ");
  //           console.log(item);
  //           const cartItem = cart.items.find((ci: any) => {
  //             console.log("ci = ");
  //             console.log(ci);
  //             return ci.productItemId === item.productItemId;
  //           });
  //           // console.log(cartItem);
  //           if (!cartItem?.productItem) {
  //             throw new Error(
  //               `ProductItem с id ${item.productItemId} не найден в базе`,
  //             );
  //           }

  //           const { price, size } = cartItem.productItem;

  //           return {
  //             productItem: {
  //               connect: { id: item.productItemId },
  //             },
  //             quantity: item.quantity,
  //             price: price, // ← Берём цену из БД — фиксируем на момент заказа
  //             size: size?.toString() || null, // ← Берём размер из БД
  //           };
  //         }),
  //       },
  //     },
  //     include: {
  //       items: {
  //         include: {
  //           productItem: {
  //             include: {
  //               product: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   // 5. Удалить все элементы корзины
  //   await prisma.cartItem.deleteMany({
  //     where: { cartId: cart.id },
  //   });

  //   // 6. Сбросить totalAmount корзины
  //   await prisma.cart.update({
  //     where: { id: cart.id },
  //     data: { totalAmount: 0 },
  //   });

  //   return order;
  // }

  // async createOrder(userId: number, dto: OrderBody) {
  //   /* 1. Корзина пользователя */
  //   const cart = await prisma.cart.findUnique({
  //     where: { userId },
  //     include: {
  //       items: {
  //         include: { productItem: { include: { product: true } } },
  //       },
  //     },
  //   });

  //   if (!cart) throw ErrorApi.BadRequestError("Корзина не найдена");
  //   if (!cart.items.length) throw ErrorApi.BadRequestError("Корзина пуста");

  //   /* 2. Готовим позиции заказа */
  //   const orderItemsData = cart.items.map((ci) => ({
  //     productItem: { connect: { id: ci.productItemId } },
  //     quantity: ci.quantity,
  //     price: ci.productItem.price,
  //     size: ci.productItem.size ? Number(ci.productItem.size) : undefined,
  //   }));

  //   /* 3. Считаем итоговую сумму */
  //   const totalAmount = orderItemsData.reduce(
  //     (sum, li) => sum + li.price * li.quantity,
  //     0,
  //   );

  //   /* 4. Создаём заказ */
  //   const order = await prisma.order.create({
  //     data: {
  //       token: dto.token,
  //       totalAmount,
  //       status: OrderStatus.PENDING,
  //       email: dto.email,
  //       phone: dto.phone,
  //       fullName: dto.fullName,
  //       address: dto.address,
  //       comment: dto.comment || null,
  //       paymentId: dto.paymentId || null,
  //       userId,
  //       items: {
  //         create: orderItemsData,
  //       },
  //     },
  //     include: {
  //       items: {
  //         include: {
  //           productItem: {
  //             include: { product: true },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   /* 5. Очищаем корзину */
  //   await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  //   await prisma.cart.update({
  //     where: { id: cart.id },
  //     data: { totalAmount: 0 },
  //   });

  //   return order;
  // }

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
