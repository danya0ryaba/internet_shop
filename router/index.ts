import { Router } from "express";
import { userController } from "../controllers/user-controller";
import { body } from "express-validator";
import { productController } from "../controllers/product-controller";
import { cartController } from "../controllers/cart-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { adminMiddleware } from "../middlewares/admin-middleware";
import { orderController } from "../controllers/order-controller";

export const router = Router();

// user
router.post(
  "/register",
  body("fullName").isLength({ min: 3, max: 20 }),
  body("email").isEmail(),
  body("password").isLength({ min: 5, max: 20 }),
  userController.registration,
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
// доступный только для админ
router.get("/users", authMiddleware, adminMiddleware, userController.getUsers);

// product
router.get("/product", productController.getProducts);
router.get("/product/:id", productController.getProduct);
router.get("/product/filter/:categoryName", productController.getFilterProduct); // фильтрация продуктов
router.get("/product-search/", productController.searchProduct); // поиск продукта (GET /product/search?name=картофель)

// только для админа
router.post(
  "/product-create",
  adminMiddleware,
  productController.createProduct,
);
router.patch(
  "/product-update",
  adminMiddleware,
  productController.updateProduct,
);
router.delete(
  "/product-delete",
  adminMiddleware,
  productController.deleteProduct,
);
router.get("/show-all-orders", adminMiddleware, orderController.allOrders); // админ должен иметь возможность смотреть заказы

// cart
router.get("/cart", authMiddleware, cartController.getCart);
router.get(
  "/cart-add-product/:id",
  authMiddleware,
  cartController.addProductInCart,
);
router.delete(
  "/cart-remove-product",
  authMiddleware,
  cartController.removeProductInCart,
);
// выбрать в корзине товар, чтобы изменить его selected CartItem
router.patch(
  "/cart-select-product",
  authMiddleware,
  cartController.selectProduct,
);
// для админа
router.get("/cart-get-all-carts", adminMiddleware, cartController.getAllCarts);

// сделать заказ
router.post(
  "/cart-make-on-order",
  authMiddleware,
  [
    body("email").isEmail(),
    body("phone").isMobilePhone("ru-RU"),
    body("fullName").notEmpty(),
    body("address").notEmpty(),
    body("token").notEmpty(),
  ],
  orderController.createOrder,
);

router.get("/cart-show-order", authMiddleware, orderController.showOrder);

// + может быть логику сброса пароля?

// + Оплата через Юкасса
