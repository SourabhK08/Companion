import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import companionRoutes from "./routes/companion.routes.js";

const app = express();

// ─── Security ─────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────
// Allow frontend (localhost:3000) to talk to backend (localhost:3001)
// credentials: true is REQUIRED for httpOnly cookies to work cross-origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// ─── Razorpay Webhook (raw body — MUST be before express.json) ─
// Razorpay webhook signature verification requires the raw, unparsed body.
// If express.json() parses it first, the signature won't match.
import { paymentRoutes } from "./routes/payment.routes.js";
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parsing ───────────────────────────────────────
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Modhuralap API is running",
    timestamp: new Date().toISOString(),
  });
});

import { userRoutes } from "./routes/user.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { walletRoutes } from "./routes/wallet.routes.js";
import { bookingRoutes } from "./routes/booking.routes.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import { cofounderRoutes } from "./routes/cofounder.routes.js";
import { chatSubscriptionRoutes } from "./routes/chat-subscription.routes.js";
import { profilePhotoRoutes } from "./routes/profile-photo.routes.js";
import { verificationRoutes } from "./routes/verification.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companions", companionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cofounders", cofounderRoutes);
app.use("/api/chat-subscriptions", chatSubscriptionRoutes);
app.use("/api/profile/photos", profilePhotoRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

export default app;
