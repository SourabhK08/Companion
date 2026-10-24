import type { Response } from "express";
import type { AdminRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import * as adminService from "../services/admin.service.js";

// ─── POST /api/admin/login ─────────────────────────────────

export async function login(req: AdminRequest, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
      return;
    }

    const result = adminService.adminLogin(String(username), String(password));

    res.status(200).json({
      success: true,
      message: "Admin authentication successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ─── GET /api/admin/me ─────────────────────────────────────

export async function getMe(req: AdminRequest, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      admin: {
        username: req.adminUsername || "admin",
        role: "admin",
      },
    },
  });
}

// ─── GET /api/admin/reviews ────────────────────────────────

export async function getReviews(_req: AdminRequest, res: Response): Promise<void> {
  try {
    const result = await adminService.getAllAppReviews();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Admin get reviews error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ─── PATCH /api/admin/reviews/:id/approve ──────────────────

export async function approveReview(req: AdminRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const review = await adminService.approveAppReview(id);

    res.status(200).json({
      success: true,
      message: "Review approved and published live",
      data: { review },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Admin approve review error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ─── PATCH /api/admin/reviews/:id/reject ───────────────────

export async function rejectReview(req: AdminRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const review = await adminService.rejectAppReview(id);

    res.status(200).json({
      success: true,
      message: "Review moved back to moderation",
      data: { review },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Admin reject review error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// ─── DELETE /api/admin/reviews/:id ─────────────────────────

export async function deleteReview(req: AdminRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    await adminService.deleteAppReview(id);

    res.status(200).json({
      success: true,
      message: "Review permanently deleted",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Admin delete review error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
