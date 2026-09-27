import { z } from "zod";

/**
 * Companion profile validation schemas.
 */

export const createCompanionSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be at most 500 characters")
    .trim(),
  interests: z
    .array(z.string().trim())
    .min(1, "At least one interest is required")
    .max(20, "At most 20 interests allowed"),
  languages: z
    .array(z.string().trim())
    .min(1, "At least one language is required")
    .max(10, "At most 10 languages allowed"),
  hourlyRate: z.coerce
    .number()
    .int()
    .min(0, "Hourly rate cannot be negative")
    .default(0),
  isAvailable: z.boolean().default(true),
});

export const updateCompanionSchema = createCompanionSchema.partial();

export const listCompanionsQuerySchema = z.object({
  gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
  city: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
});

export type CreateCompanionInput = z.infer<typeof createCompanionSchema>;
export type UpdateCompanionInput = z.infer<typeof updateCompanionSchema>;
export type ListCompanionsQuery = z.infer<typeof listCompanionsQuerySchema>;
