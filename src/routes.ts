import express from "express";
import authController from "./controller/auth.controller";
import { authenticate } from "./middlewares/auth.middleware";
import { verifyEmail } from "./controller/verify-email.controller";

const router = express.Router();
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/verify-email", verifyEmail);
router.post("/add-user", authController.addUser);
router.get("/auth/me", authenticate, authController.me);

export default router;
