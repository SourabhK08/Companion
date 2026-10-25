import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as paymentService from "../services/payment.service.js";

// ─── POST /api/payments/create-order ──────────────────────

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be a positive number (in rupees)",
      });
      return;
    }

    const order = await paymentService.createOrder(req.userId, amount);

    res.json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message });
  }
}

// ─── POST /api/payments/verify ────────────────────────────

export async function verifyPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
      return;
    }

    const result = await paymentService.verifyPayment(
      req.userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: true,
      data: {
        wallet: result.wallet,
        alreadyCredited: result.alreadyCredited,
      },
      message: result.alreadyCredited
        ? "Payment was already processed"
        : "Payment verified and wallet credited successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    console.error("Verify payment error:", error);
    res.status(400).json({ success: false, message });
  }
}

// ─── POST /api/payments/webhook ───────────────────────────

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!signature) {
      res.status(400).json({ status: "error", message: "Missing signature header" });
      return;
    }

    // req.body is a raw Buffer (set up by express.raw() in app.ts)
    const rawBody = req.body as Buffer;

    const result = await paymentService.handleWebhook(rawBody, signature);

    res.json({ ...result, status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Webhook error:", error);
    res.status(400).json({ status: "error", message });
  }
}
