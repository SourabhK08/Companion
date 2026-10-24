import { z } from "zod";

// ─── Booking Review Validation ────────────────────────────

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .max(500, "Review must be under 500 characters")
    .optional()
    .nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ─── App/Platform Review Validation ───────────────────────

export const createAppReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be under 500 characters"),
});

export type CreateAppReviewInput = z.infer<typeof createAppReviewSchema>;
