import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../schemas/verification.schema.js";
import * as verificationController from "../controllers/verification.controller.js";

const router = Router();

// All verification routes require authentication
router.use(authenticate);

// Phone verification
router.post(
  "/phone/send-otp",
  validate(sendOtpSchema),
  verificationController.sendOtp
);
router.post(
  "/phone/verify-otp",
  validate(verifyOtpSchema),
  verificationController.verifyOtp
);

// Verification status
router.get("/status", verificationController.getStatus);

export const verificationRoutes = router;
