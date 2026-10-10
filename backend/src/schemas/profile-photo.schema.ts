import { z } from "zod";

// ─── Allowed image types ──────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;

/** Max upload size: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Max image dimensions */
export const MAX_IMAGE_DIMENSION = 4096;

// ─── Upload URL request ───────────────────────────────────

export const uploadUrlSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long"),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    message: `Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
  }),
  size: z
    .number()
    .int()
    .positive("Size must be positive")
    .max(MAX_FILE_SIZE, `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;

// ─── Complete upload request ──────────────────────────────

export const completeUploadSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
  publicId: z.string().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  bytes: z.number().int().optional(),
  format: z.string().optional(),
  secureUrl: z.string().optional(),
});

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;

// ─── Helpers ──────────────────────────────────────────────

/**
 * Map a MIME type to the file extension we'll use for the blob.
 * We always store as the original format (no server-side conversion for now).
 */
export function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[mime] ?? ".jpg";
}

/**
 * Sanitize a filename — strip path separators and null bytes.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[\\/]/g, "_")      // no path separators
    .replace(/\0/g, "")          // no null bytes
    .replace(/\.\./g, "_")       // no path traversal
    .slice(0, 255);
}
