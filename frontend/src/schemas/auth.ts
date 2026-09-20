/**
 * Auth form validation schemas.
 *
 * Uses Zod for type-safe, composable validation.
 * These schemas are the single source of truth for form validation rules.
 */

import { z } from "zod";

/* ─── Login ─── */

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

export type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── Sign Up ─── */

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    mobile: z
      .string()
      .min(1, "Mobile number is required")
      .min(10, "Enter a valid mobile number"),
    city: z.string().min(1, "Please select your city"),
    dob: z.string().min(1, "Date of birth is required"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the Terms & Conditions",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

