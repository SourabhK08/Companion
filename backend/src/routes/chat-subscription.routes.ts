import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { subscribeSchema } from "../schemas/chat-subscription.schema.js";
import {
  createSubscription,
  getStatus,
  getHistory,
} from "../controllers/chat-subscription.controller.js";

const router = Router();

router.post("/subscribe", authenticate, validate(subscribeSchema), createSubscription);
router.get("/status", authenticate, getStatus);
router.get("/history", authenticate, getHistory);

export { router as chatSubscriptionRoutes };
