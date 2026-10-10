import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { AppError } from "../services/auth.service.js";
import {
  uploadUrlSchema,
  completeUploadSchema,
} from "../schemas/profile-photo.schema.js";
import {
  createUploadSignature,
  completeUpload,
  deletePhoto,
  listPhotos,
  cleanupStaleUploads,
} from "../services/profile-photo.service.js";
import { resolveImageUrl } from "../services/cloudinary.service.js";

// ─── POST /api/profile/photos/upload-url ──────────────────

export async function getUploadUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const input = uploadUrlSchema.parse(req.body);
    const result = await createUploadSignature(userId, input);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error, "Failed to generate upload signature");
  }
}

// ─── POST /api/profile/photos/complete ────────────────────

export async function completePhotoUpload(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const input = completeUploadSchema.parse(req.body);
    const photo = await completeUpload(userId, input);

    res.status(200).json({
      success: true,
      data: { photo },
    });
  } catch (error) {
    handleError(res, error, "Failed to complete upload");
  }
}

// ─── GET /api/profile/photos ──────────────────────────────

export async function getPhotos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const photos = await listPhotos(userId);

    res.status(200).json({
      success: true,
      data: { photos },
    });
  } catch (error) {
    handleError(res, error, "Failed to list photos");
  }
}

// ─── DELETE /api/profile/photos/:photoId ──────────────────

export async function removePhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const rawPhotoId = req.params.photoId;
    const photoId = Array.isArray(rawPhotoId) ? rawPhotoId[0] : rawPhotoId;
    if (!photoId || typeof photoId !== "string") {
      res.status(400).json({ success: false, message: "Photo ID is required" });
      return;
    }

    await deletePhoto(userId, photoId);

    res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete photo");
  }
}

// ─── POST /api/profile/photos/cleanup ─────────────────────

export async function cleanup(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cleaned = await cleanupStaleUploads(30);

    res.status(200).json({
      success: true,
      data: { cleaned },
    });
  } catch (error) {
    handleError(res, error, "Failed to cleanup");
  }
}

// ─── GET /api/profile/photos/resolve-url ──────────────────

export async function resolveUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const storageKey = req.query.key as string | undefined;
    if (!storageKey) {
      res.status(400).json({ success: false, message: "key query parameter is required" });
      return;
    }

    const variant = (req.query.variant as string) || "profile";
    const imageUrl = resolveImageUrl(storageKey, variant as "thumbnail" | "card" | "profile" | "original");

    res.status(200).json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    handleError(res, error, "Failed to resolve URL");
  }
}

// ─── Error Handler ────────────────────────────────────────

function handleError(res: Response, error: unknown, fallback: string) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof Error && error.name === "ZodError") {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: JSON.parse(error.message),
    });
    return;
  }
  console.error(`${fallback}:`, error);
  res.status(500).json({ success: false, message: fallback });
}
