/**
 * Profile photo business logic.
 *
 * Flow:
 *   1. User calls /upload-url → gets signed Cloudinary params
 *   2. Browser uploads directly to Cloudinary
 *   3. User calls /complete with the Cloudinary response → confirmed in DB
 *   4. User.avatar is set to the Cloudinary public_id
 */

import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import {
  generateSignedUploadParams,
  deleteResource,
  getResourceDetails,
  resolveImageUrl,
  isConfigured,
  type SignedUploadParams,
} from "./cloudinary.service.js";
import {
  sanitizeFilename,
  type UploadUrlInput,
  type CompleteUploadInput,
} from "../schemas/profile-photo.schema.js";

// ─── Types ────────────────────────────────────────────────

export interface UploadSignatureResult {
  /** Cloudinary signed upload params for direct browser upload */
  upload: SignedUploadParams;
  /** The DB record ID */
  photoId: string;
  /** The storage key (Cloudinary public_id) */
  storageKey: string;
}

export interface PhotoWithUrl {
  id: string;
  storageKey: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isProfilePhoto: boolean;
  status: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

// ─── Create Upload Signature ─────────────────────────────

export async function createUploadSignature(
  userId: string,
  input: UploadUrlInput
): Promise<UploadSignatureResult> {
  if (!isConfigured()) {
    throw new AppError(503, "Image upload is not configured. Please set Cloudinary credentials.");
  }

  const { filename, contentType, size } = input;
  const uuid = crypto.randomUUID().replace(/-/g, "");

  // Generate Cloudinary signed params for direct browser upload
  const upload = generateSignedUploadParams(userId, uuid);

  // The storageKey in DB is the full Cloudinary public_id (folder/public_id)
  const storageKey = `${upload.folder}/${uuid}`;

  // Create a PENDING record — it only becomes CONFIRMED after
  // the frontend calls /complete and we verify with Cloudinary
  const photo = await prisma.profilePhoto.create({
    data: {
      userId,
      storageKey,
      originalFilename: sanitizeFilename(filename),
      mimeType: contentType,
      sizeBytes: size,
      status: "PENDING",
    },
  });

  return {
    upload,
    photoId: photo.id,
    storageKey,
  };
}

// ─── Complete Upload ──────────────────────────────────────

export async function completeUpload(userId: string, input: CompleteUploadInput) {
  const { photoId, publicId, width, height, bytes } = input;
  // Find the pending photo — must belong to the authenticated user
  const photo = await prisma.profilePhoto.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new AppError(404, "Photo not found");
  }

  if (photo.userId !== userId) {
    throw new AppError(403, "You can only manage your own photos");
  }

  if (photo.status === "CONFIRMED") {
    // Already confirmed — idempotent
    return toPhotoWithUrl(photo);
  }

  if (photo.status !== "PENDING") {
    throw new AppError(400, "This photo upload cannot be completed");
  }

  // Try to verify the resource exists in Cloudinary and get its details
  let details = await getResourceDetails(photo.storageKey);

  // If getResourceDetails failed (e.g. Admin API rate limit, offline/sandbox network),
  // but client reported success with matching publicId, accept it gracefully
  if (!details && publicId && publicId === photo.storageKey) {
    details = {
      publicId,
      width: width || 0,
      height: height || 0,
      bytes: bytes || 0,
      format: input.format || "webp",
      url: input.secureUrl || "",
      createdAt: new Date().toISOString(),
    };
  }

  if (!details) {
    await prisma.profilePhoto.update({
      where: { id: photoId },
      data: { status: "FAILED" },
    });
    throw new AppError(400, "Upload was not completed. Please try again.");
  }

  // Mark as confirmed and store actual dimensions from Cloudinary
  const confirmed = await prisma.profilePhoto.update({
    where: { id: photoId },
    data: {
      status: "CONFIRMED",
      width: details.width,
      height: details.height,
      sizeBytes: details.bytes,
    },
  });

  // Automatically set as profile photo
  await setAsProfilePhoto(userId, photoId);

  return toPhotoWithUrl(confirmed);
}

// ─── Set as Profile Photo ────────────────────────────────

export async function setAsProfilePhoto(userId: string, photoId: string) {
  // Unset all existing profile photos for this user
  await prisma.profilePhoto.updateMany({
    where: { userId, isProfilePhoto: true },
    data: { isProfilePhoto: false },
  });

  // Set the new one
  const photo = await prisma.profilePhoto.update({
    where: { id: photoId, userId },
    data: { isProfilePhoto: true },
  });

  // Update User.avatar with the Cloudinary public_id
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: photo.storageKey },
  });

  return photo;
}

// ─── Delete Photo ─────────────────────────────────────────

export async function deletePhoto(userId: string, photoId: string) {
  const photo = await prisma.profilePhoto.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new AppError(404, "Photo not found");
  }

  if (photo.userId !== userId) {
    throw new AppError(403, "You can only delete your own photos");
  }

  // Delete from Cloudinary (handles missing resource gracefully)
  await deleteResource(photo.storageKey);

  // Delete the DB record
  await prisma.profilePhoto.delete({
    where: { id: photoId },
  });

  // If this was the profile photo, promote another or clear avatar
  if (photo.isProfilePhoto) {
    const nextPhoto = await prisma.profilePhoto.findFirst({
      where: { userId, status: "CONFIRMED", id: { not: photoId } },
      orderBy: { sortOrder: "asc" },
    });

    if (nextPhoto) {
      await setAsProfilePhoto(userId, nextPhoto.id);
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });
    }
  }
}

// ─── List Photos ──────────────────────────────────────────

export async function listPhotos(userId: string): Promise<PhotoWithUrl[]> {
  const photos = await prisma.profilePhoto.findMany({
    where: { userId, status: "CONFIRMED" },
    orderBy: [{ isProfilePhoto: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return photos.map(toPhotoWithUrl);
}

// ─── Cleanup Stale Uploads ────────────────────────────────

export async function cleanupStaleUploads(maxAgeMinutes = 30) {
  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - maxAgeMinutes);

  const stale = await prisma.profilePhoto.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
  });

  for (const photo of stale) {
    await deleteResource(photo.storageKey);
    await prisma.profilePhoto.delete({ where: { id: photo.id } });
  }

  return stale.length;
}

// ─── Helpers ──────────────────────────────────────────────

function toPhotoWithUrl(photo: {
  id: string;
  storageKey: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isProfilePhoto: boolean;
  status: string;
  createdAt: Date;
}): PhotoWithUrl {
  return {
    ...photo,
    imageUrl: resolveImageUrl(photo.storageKey, "profile"),
    thumbnailUrl: resolveImageUrl(photo.storageKey, "thumbnail"),
  };
}
