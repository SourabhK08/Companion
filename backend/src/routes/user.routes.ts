import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { updateProfile } from "../controllers/user.controller.js";

const router = Router();

// Protect all user routes
router.use(authenticate);

// Update current user profile
router.patch("/me", updateProfile);

export const userRoutes = router;
