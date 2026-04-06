import { ErrorApi } from "../exeptions/error-api";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";

class CartService {
  async getCart(userId: number) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: {
                product: true, // включая продукт
              },
            },
          },
        },
      },
    });
    return cart;
  }

  async addProductInCart(
    userId: number,
    productId: number,
    quantity: number = 1,
  ) {
    // существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cart: true },
    });

    if (!user?.cart) {
      throw ErrorApi.BadRequestError("Пользователь не найден");
    }

    // Если у пользователя нет корзины, создаем ее,
    // хотя такого быть не должно тк при регистрации корзина создается автоматом.
    // Хотя если пользователь не зареган то можно сделать так

    let cart = user.cart!;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw ErrorApi.BadRequestError("Товар не найден");
    }

    const productItem = await prisma.productItem.findFirst({
      where: { productId: product.id },
    });

    if (!productItem) {
      throw ErrorApi.BadRequestError(
        "У товара нет доступных вариантов (ProductItem)",
      );
    }

    // Проверяем, существует ли товар в корзине
    const existingCartProduct = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productItemId: productItem.id,
      },
    });

    if (existingCartProduct) {
      // Если товар уже в корзине, увеличиваем количество
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartProduct.id },
        data: {
          quantity: existingCartProduct.quantity + quantity,
        },
        include: {
          productItem: true,
        },
      });

      // Обновляем общую сумму корзины
      await this.updateCartTotal(cart.id);
      return updatedItem;
    } else {
      //ОШИБКА ТУТ
      // Если товара нет в корзине, создаем новую запись
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: productItem.id,
          quantity,
        },
        include: {
          productItem: true,
        },
      });

      // Обновляем общую сумму корзины
      await this.updateCartTotal(cart.id);
      return newItem;
    }
  }

  // тут переписать тк в removeProductInCart тоже нужно использовать updateCartTotal
  private async updateCartTotal(cartId: number) {
    // Получаем все товары в корзине
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        productItem: true,
      },
    });

    // Вычисляем общую сумму
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.productItem.price * item.quantity;
    }, 0);

    // Обновляем корзину
    await prisma.cart.update({
      where: { id: cartId },
      data: { totalAmount },
    });
  }

  async removeProductInCart(userId: number, cartItemId: number) {
    // Проверяем, что корзина принадлежит текущему пользователю
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      throw ErrorApi.BadRequestError("Корзина не найдена");
    }

    // Проверяем, есть ли такой CartItem в корзине
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw ErrorApi.BadRequestError(
        "Товар не найден в корзине или принадлежит другой корзине",
      );
    }

    // Удаляем CartItem
    await prisma.cartItem.delete({ where: { id: cartItemId } });

    // Обновляем totalAmount корзины
    const remainingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { productItem: { include: { product: true } } },
    });

    const newTotalAmount = remainingItems.reduce((sum, item) => {
      return sum + item.quantity * (item.productItem.product.price || 0);
    }, 0);

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalAmount: newTotalAmount },
    });

    return {
      message: "Товар удален и сумма обновлена",
      totalAmount: newTotalAmount,
    };
  }

  async makeOnOrder() {}

  // возиожно только для админа?
  async getAllCarts() {
    const allCarts = prisma.cart.findMany();
    return allCarts;
  }

  async selectProduct(id: number) {
    const current = await prisma.cartItem.findUnique({ where: { id } });
    if (!current) throw ErrorApi.BadRequestError("CartItem не найден");

    return prisma.cartItem.update({
      where: { id },
      data: { selected: !current.selected },
    });
  }
}

export const cartService = new CartService();
