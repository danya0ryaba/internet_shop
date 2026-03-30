import { Router } from "express";
import { userController } from "../controllers/user-controller";
import { body } from "express-validator";
import { productController } from "../controllers/product-controller";
import { cartController } from "../controllers/cart-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import { adminMiddleware } from "../middlewares/admin-middleware";

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

// cart
// нужно переписать чтобы id user доставать из jwt, может как middleware?
router.get("/cart", cartController.getCart);
router.get("/cart-add-product/:id", cartController.addProductInCart);
router.post("/cart-remove-product", cartController.removeProductInCart);
// может не нужно, хз?
router.get("/cart-get-all-carts", adminMiddleware, cartController.getAllCarts);

// не совсем понимаю как сделать логику заказа
router.post("/cart-make-on-order", cartController.makeOnOrder);

// + может быть логику сброса пароля?
