import express from "express";
import authController from "./controller/auth.controller";
import { authenticate } from "./middlewares/auth.middleware";
import { verifyEmail } from "./controller/verify-email.controller";
import uploadMiddleware from "./middlewares/upload.middleware";
import uploadController from "./controller/upload.controller";
import darahController from "./controller/darah.controller";
import orderController from "./controller/order.controller";

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/verify-email", verifyEmail);
router.post("/add-user", authController.addUser);
router.get("/auth/me", authenticate, authController.me);
router.patch("/profile", authController.profile);
router.get("/users/all",authController.findAll);
router.get("/users/:id", authController.findOne);

router.post("/darah/add", darahController.create);
router.get("/darah/:id", darahController.findOne);
router.patch("/darah/:id", darahController.update);
router.get("/darah/all", darahController.findAll);
router.get("/darah/institusi/:institusiName", darahController.darahByInstitusiKesehatan);

router.post("/order/add", orderController.create);
router.get("/order/:id", orderController.findOne);
router.patch("/order/:id", orderController.update);
router.get("/order/all", orderController.findAll);
router.patch("/order/status/:id", orderController.status);
router.get("/order/institusi/:institusiName", orderController.darahByInstitusiKesehatan);

router.post("/upload", uploadMiddleware.single, uploadController.single);
router.post("/uploads", uploadMiddleware.multiple, uploadController.multiple);

export default router;