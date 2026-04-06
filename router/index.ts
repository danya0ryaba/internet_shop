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
  body("email").isEmail(),
  body("password").isLength({ min: 5, max: 20 }),
  userController.registration,
);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
// просто тестовый эндпоит доступный только авторизованным пользователем(только для админ)
router.get(
  "/users",
  //  authMiddleware, adminMiddleware?
  userController.getUsers,
);

// product
router.get("/product", productController.getProducts);
router.get("/product/:id", productController.getProduct);
// только для админа
router.post(
  "/product-create",
  adminMiddleware,
  productController.createProduct,
);
router.post(
  "/product-update",
  adminMiddleware,
  productController.updateProduct,
);
router.post(
  "/product-delete",
  adminMiddleware,
  productController.deleteProduct,
);
// админ должен иметь возможность смотреть заказы
router.get("/show-all-orders", adminMiddleware, orderController.allOrders);

// фильтрация продуктов
router.get("/product/filter/:categoryName", productController.getFilterProduct);
// поиск продукта (GET /product/search?name=картофель)
router.get("/product-search/", productController.searchProduct);

// cart
// может переписать чтобы id user доставать из jwt, может как middleware?
router.get("/cart", cartController.getCart);
router.get("/cart-add-product/:id", cartController.addProductInCart);
router.post("/cart-remove-product", cartController.removeProductInCart);
// может не нужно, хз?
router.get(
  "/cart-get-all-carts",
  // adminMiddleware,
  cartController.getAllCarts,
);

// выбрать в корзине товар, чтобы изменить его selected CartItem

router.post("cart-select-product", cartController.selectProduct);

// сделать заказ
router.post(
  "/cart-make-on-order",
  // authMiddleware,
  // body("email").isEmail(),
  // body("phone").isMobilePhone("ru-RU"),
  [
    body("email").isEmail(),
    body("phone").isMobilePhone("ru-RU"),
    body("fullName").notEmpty(),
    body("address").notEmpty(),
    body("token").notEmpty(),
  ],
  orderController.createOrder,
);

router.get("/cart-show-order", orderController.showOrder);

// + может быть логику сброса пароля?

// + Оплата через Юкасса
