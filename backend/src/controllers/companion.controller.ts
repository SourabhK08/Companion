import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import {
  createOrUpdateCompanion,
  updateCompanion,
  listCompanions,
  getCompanionById,
  getCompanionByUserId,
} from "../services/companion.service.js";
import { listCompanionsQuerySchema } from "../schemas/companion.schema.js";

// ─── POST /api/companions — Create or replace own profile ─

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const companion = await createOrUpdateCompanion(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Companion profile saved",
      data: { companion },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Create companion error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/companions — List with filters ──────────────

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const query = listCompanionsQuerySchema.parse(req.query);
    const result = await listCompanions(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("List companions error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/companions/me — Get own companion profile ───

export async function getOwn(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const companion = await getCompanionByUserId(req.userId);

    res.status(200).json({
      success: true,
      data: { companion }, // null if no profile exists yet
    });
  } catch (error) {
    console.error("Get own companion error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── GET /api/companions/:id — Get single companion ───────

export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const companion = await getCompanionById(id);

    res.status(200).json({
      success: true,
      data: { companion },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Get companion error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

// ─── PATCH /api/companions — Update own profile ───────────

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const companion = await updateCompanion(req.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: { companion },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Update companion error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}
