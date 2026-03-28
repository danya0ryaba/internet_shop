import { prisma } from "../lib/prisma";

class CartService {
  async getCart(id: number) {
    const cart = await prisma.cart.findUnique({
      where: { id },
    });
    return cart;
  }

  async addProductInCart() {}

  async removeProductInCart() {}

  async makeOnOrder() {}

  async getAllCarts() {
    const allCarts = prisma.cart.findMany();
    return allCarts;
  }
}

export const cartService = new CartService();
