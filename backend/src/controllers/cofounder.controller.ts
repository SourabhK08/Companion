import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import {
  createOrUpdateProfile,
  updateProfile,
  listCoFounders,
  getById,
  getByUserId,
} from "../services/cofounder.service.js";
import { listCoFoundersQuerySchema } from "../schemas/cofounder.schema.js";

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const profile = await createOrUpdateProfile(req.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Co-Founder profile saved",
      data: { profile },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Create cofounder error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query = listCoFoundersQuerySchema.parse(req.query);
    // Never show the logged-in user their own card in the explore list
    const result = await listCoFounders(query, req.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("List cofounders error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function getOwn(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const profile = await getByUserId(req.userId);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error("Get own cofounder error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const profile = await getById(id);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Get cofounder error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const profile = await updateProfile(req.userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: { profile },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    console.error("Update cofounder error:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
}
