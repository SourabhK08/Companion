import { z } from "zod";

/**
 * Auth validation schemas.
 *
 * These mirror the frontend Zod schemas so validation is consistent
 * on both client and server.
 */

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    ),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
