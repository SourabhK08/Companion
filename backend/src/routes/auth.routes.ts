import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Public routes (no auth required)
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

// Protected routes (auth required)
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
