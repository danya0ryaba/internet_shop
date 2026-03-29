import { ErroApi } from "../exeptions/error-api";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";

class CartService {
  async getCart(id: number) {
    const cart = await prisma.cart.findUnique({
      where: { id },
    });
    return cart;
  }

  async addProductInCart(
    userId: number,
    productId: number,
    quantity: number = 1,
  ) {
    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { cart: true },
    });

    if (!user?.cart) {
      throw ErroApi.BadRequestError("Пользователь не найден");
    }

    // Если у пользователя нет корзины, создаем ее,
    // хотя такого быть не должно тк при регистрации корзина создается автоматом.
    // Хотя если пользователь не зареган то можно сделать так

    let cart = user.cart!;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw ErroApi.BadRequestError("Товар не найден");
    }

    const productItem = await prisma.productItem.findFirst({
      where: { productId: product.id },
    });

    if (!productItem) {
      throw ErroApi.BadRequestError(
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

  async removeProductInCart() {}

  async makeOnOrder() {}

  // возиожно только для админа?
  async getAllCarts() {
    const allCarts = prisma.cart.findMany();
    return allCarts;
  }
}

export const cartService = new CartService();

// "user": {
//   "email": "eu0vs@sharebot.net",
//   "id": 10,
//   "isActivated": true,
//   "role": "USER"
// }
