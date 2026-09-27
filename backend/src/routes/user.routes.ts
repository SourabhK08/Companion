import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { updateProfile } from "../controllers/user.controller.js";
import * as savedController from "../controllers/saved.controller.js";

const router = Router();

// Protect all user routes
router.use(authenticate);

// Update current user profile
router.patch("/me", updateProfile);

// Saved Companions
router.get("/me/saved", savedController.getSavedCompanions);
router.post("/me/saved/:companionProfileId", savedController.saveCompanion);
router.delete("/me/saved/:companionProfileId", savedController.unsaveCompanion);

export const userRoutes = router;
