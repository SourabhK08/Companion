import { z } from "zod";

/**
 * Verification validation schemas.
 *
 * Phone number validation:
 *   - Accepts 10-digit Indian numbers with optional +91 or 91 prefix
 *   - Strips non-digit characters before validation
 *
 * OTP validation:
 *   - Exactly 6 digits
 */

const phoneRegex = /^(\+?91)?[6-9]\d{9}$/;

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/[\s\-()]/g, "")) // Strip formatting chars
    .refine((val) => phoneRegex.test(val), {
      message:
        "Invalid phone number. Enter a valid 10-digit Indian mobile number",
    }),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/[\s\-()]/g, "")),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
