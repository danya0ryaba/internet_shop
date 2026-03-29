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
router.get("/users", authMiddleware, userController.getUsers);

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
router.get("/cart/:id", cartController.getCart);
router.get("/cart-add-product/:id", cartController.addProductInCart);

router.post("/cart-remove-product", cartController.removeProductInCart);
router.post("/cart-make-on-order", cartController.makeOnOrder);
router.get("/cart-get-all-carts", cartController.getAllCarts);
