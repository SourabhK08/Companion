/**
 * Login form validation schema.
 *
 * Uses Zod for type-safe, composable validation.
 * This schema is the single source of truth for login form validation rules.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or mobile number is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

/** TypeScript type inferred from the login schema. */
export type LoginFormValues = z.infer<typeof loginSchema>;
