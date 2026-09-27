import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  createCompanionSchema,
  updateCompanionSchema,
} from "../schemas/companion.schema.js";
import * as companionController from "../controllers/companion.controller.js";

const router = Router();

// Protected routes (must come BEFORE /:id to avoid "me" matching as ID)
router.post("/", authenticate, validate(createCompanionSchema), companionController.create);
router.get("/me", authenticate, companionController.getOwn);
router.patch("/me", authenticate, validate(updateCompanionSchema), companionController.update);

// Public routes
router.get("/", companionController.list);
router.get("/:id", companionController.getOne);

export default router;
