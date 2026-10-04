import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import {
  subscribe,
  getActiveSubscription,
  getSubscriptionHistory,
} from "../services/chat-subscription.service.js";
import { subscribeSchema } from "../schemas/chat-subscription.schema.js";

export async function createSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { plan } = subscribeSchema.parse(req.body);

    const subscription = await subscribe(req.userId, plan);

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: { subscription },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Create subscription error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function getStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const subscription = await getActiveSubscription(req.userId);

    res.status(200).json({
      success: true,
      data: {
        hasActiveSubscription: !!subscription,
        subscription,
      },
    });
  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const history = await getSubscriptionHistory(req.userId);

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    console.error("Get subscription history error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}
