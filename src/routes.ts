import express from "express";
import authController from "./controller/auth.controller";
import { authenticate } from "./middlewares/auth.middleware";
import { verifyEmail } from "./controller/verify-email.controller";
import uploadMiddleware from "./middlewares/upload.middleware";
import uploadController from "./controller/upload.controller";
import darahController from "./controller/darah.controller";
import orderController from "./controller/order.controller";
import aclMiddleware from "./middlewares/acl.middleware";

const router = express.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/verify-email", verifyEmail);
router.post("/add-user", authenticate, aclMiddleware(["Admin"]), authController.addUser);
router.get("/auth/me", authenticate, authController.me);
router.patch("/profile", authenticate, authController.profile);
router.get("/users/all", authController.findAll);
router.get("/users/:id", authenticate, aclMiddleware(["Admin"]), authController.findOne);

router.post("/darah/add", authenticate, aclMiddleware(["Institusi Kesehatan"]), darahController.create);
router.get("/darah/:id", authenticate, aclMiddleware(["Institusi Kesehatan"]), darahController.findOne);
router.patch("/darah/:id", darahController.update);
router.get("/darah/all", darahController.findAll);
router.get("/darah/institusi/:institusiName", authenticate, aclMiddleware(["Institusi Kesehatan"]), darahController.darahByInstitusiKesehatan);

router.post("/order/add", authenticate, aclMiddleware(["Partisipan"]), orderController.create);
router.get("/order/:id", authenticate, aclMiddleware(["Partisipan"]), orderController.findOne);
router.patch("/order/:id", authenticate, aclMiddleware(["Partisipan"]), orderController.update);
router.get("/order/all", orderController.findAll);
router.patch("/order/status/:id", authenticate, orderController.status);
router.get("/order/institusi/:institusiName",authenticate, aclMiddleware(["Institusi Kesehatan"]), orderController.darahByInstitusiKesehatan);
router.get("/order/ordered/:partisipanId", authenticate, aclMiddleware(["Partisipan"]), orderController.findOrderedPartisipan);
router.get("/order/history/:partisipanId", authenticate, aclMiddleware(["Partisipan"]), orderController.findByHistoryPartisipan);

router.post("/upload", uploadMiddleware.single, uploadController.single);
router.post("/uploads", uploadMiddleware.multiple, uploadController.multiple);

export default router;