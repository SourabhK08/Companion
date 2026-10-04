import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createCoFounderSchema, updateCoFounderSchema } from "../schemas/cofounder.schema.js";
import {
  create,
  list,
  getOwn,
  getOne,
  update,
} from "../controllers/cofounder.controller.js";

const router = Router();

// Protected routes first so "/me" isn't matched as ":id"
router.get("/me", authenticate, getOwn);
router.post("/", authenticate, validate(createCoFounderSchema), create);
router.patch("/me", authenticate, validate(updateCoFounderSchema), update);

// Public routes
router.get("/", list);
router.get("/:id", getOne);

export { router as cofounderRoutes };
