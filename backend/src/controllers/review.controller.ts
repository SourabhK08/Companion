import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import * as reviewService from "../services/review.service.js";

// ─── POST /api/reviews — Submit a booking review ──────────

export async function submitReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const result = await reviewService.submitReview(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Submit review error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/user/:userId — Reviews for a user ───

export async function getReviewsForUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const page = parseInt(String(req.query.page ?? "1")) || 1;
    const limit = parseInt(String(req.query.limit ?? "10")) || 10;

    const result = await reviewService.getReviewsForUser(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get reviews for user error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/booking/:bookingId — Reviews for booking ─

export async function getReviewsForBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookingId = req.params.bookingId as string;
    const reviews = await reviewService.getReviewsForBooking(bookingId);

    res.status(200).json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    console.error("Get reviews for booking error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/stats/:userId — Rating stats ────────

export async function getReviewStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const stats = await reviewService.getReviewStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/can-review/:bookingId — Check eligibility ─

export async function canReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const bookingId = req.params.bookingId as string;
    const result = await reviewService.canReview(req.userId, bookingId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Can review error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ═══════════════════════════════════════════════════════════
// App / Platform Reviews
// ═══════════════════════════════════════════════════════════

// ─── POST /api/reviews/app — Submit/update app review ─────

export async function submitAppReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const review = await reviewService.submitAppReview(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: "App review submitted successfully",
      data: { review },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Submit app review error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/app — List approved app reviews (public) ─

export async function listAppReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? "1")) || 1;
    const limit = parseInt(String(req.query.limit ?? "10")) || 10;

    const result = await reviewService.listApprovedAppReviews(page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("List app reviews error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/reviews/app/me — Get own app review ─────────

export async function getMyAppReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const review = await reviewService.getMyAppReview(req.userId);

    res.status(200).json({
      success: true,
      data: { review }, // null if none exists
    });
  } catch (error) {
    console.error("Get my app review error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}
