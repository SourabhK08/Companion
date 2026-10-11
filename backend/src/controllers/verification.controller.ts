import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  getVerificationStatus,
} from "../services/verification.service.js";

// ─── POST /api/verification/phone/send-otp ────────────────

export async function sendOtp(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { phone } = req.body;

    const result = await sendPhoneOtp(userId, phone);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresInSeconds: result.expiresInSeconds,
        // Only present in development mode
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
}

// ─── POST /api/verification/phone/verify-otp ──────────────

export async function verifyOtp(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { phone, otp } = req.body;

    const result = await verifyPhoneOtp(userId, phone, otp);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        verification: result.user,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
}

// ─── GET /api/verification/status ─────────────────────────

export async function getStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const status = await getVerificationStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get verification status.",
    });
  }
}

// ─── POST /api/verification/email/send-otp ────────────────

export async function sendEmailOtpHandler(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await sendEmailOtp(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresInSeconds: result.expiresInSeconds,
        email: result.email,
        // Only present in development mode
        ...("devOtp" in result && result.devOtp ? { devOtp: result.devOtp } : {}),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Send email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
}

// ─── POST /api/verification/email/verify-otp ──────────────

export async function verifyEmailOtpHandler(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await verifyEmailOtp(userId, req.body.otp);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        verification: result.user,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Verify email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
}
