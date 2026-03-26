import { Router } from "express";
import { userController } from "../controllers/user-controller";
import { body } from "express-validator";
import { productController } from "../controllers/product-controller";

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
// просто тестовый эндпоит доступный только авторизованным пользователем
router.get(
  "/users",
  // authMiddleware,
  userController.getUsers,
);

// product
router.get("/product", productController.getProducts);
router.get("/product/:id", productController.getProduct);

router.post("/product-create", productController.createProduct);
router.post("/product-update", productController.updateProduct);
router.post("/product-delete", productController.deleteProduct);
