import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUploadUrl,
  completePhotoUpload,
  getPhotos,
  removePhoto,
  cleanup,
  resolveUrl,
} from "../controllers/profile-photo.controller.js";

const router = Router();

// All profile photo routes require authentication
router.use(authenticate);

// Generate a short-lived SAS URL for direct browser upload
router.post("/upload-url", getUploadUrl);

// Confirm that the upload completed successfully
router.post("/complete", completePhotoUpload);

// List the authenticated user's confirmed photos
router.get("/", getPhotos);

// Resolve a storageKey to a temporary read URL
router.get("/resolve-url", resolveUrl);

// Delete a specific photo (blob + DB record)
router.delete("/:photoId", removePhoto);

// Cleanup stale pending uploads (dev/admin utility)
router.post("/cleanup", cleanup);

export { router as profilePhotoRoutes };
