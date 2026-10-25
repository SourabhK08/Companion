import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as paymentController from "../controllers/payment.controller.js";

const router = Router();

// ─── Authenticated Routes ─────────────────────────────────
router.post("/create-order", authenticate, paymentController.createOrder);
router.post("/verify", authenticate, paymentController.verifyPayment);

// ─── Webhook (NO auth — Razorpay calls this directly) ─────
// Body parsing is handled specially in app.ts (express.raw)
router.post("/webhook", paymentController.handleWebhook);

export const paymentRoutes = router;
