import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "./auth.service.js";

/**
 * Email service — thin wrapper around nodemailer (SMTP).
 *
 * Works with any SMTP provider (Gmail app password, SES, SendGrid, Resend, Mailgun…).
 * Configure via SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / EMAIL_FROM.
 */

let transporter: Transporter | null = null;

export function isEmailConfigured(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // 465 = implicit TLS, others use STARTTLS
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

/**
 * Send a verification OTP email.
 *
 * Throws AppError(503) if SMTP is not configured or delivery fails, so the
 * caller can roll back the stored OTP and tell the user honestly.
 */
export async function sendOtpEmail(
  to: string,
  otp: string,
  expiresInMinutes: number
): Promise<void> {
  if (!isEmailConfigured()) {
    throw new AppError(
      503,
      "Email service is not available right now. Please try again later"
    );
  }

  const from = env.EMAIL_FROM ?? `Modhuralap <${env.SMTP_USER}>`;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject: `${otp} is your Modhuralap verification code`,
      text:
        `Your Modhuralap email verification code is ${otp}.\n` +
        `It is valid for ${expiresInMinutes} minutes.\n\n` +
        `If you didn't request this, you can safely ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#411522">
          <h2 style="margin:0 0 8px;color:#7a1f39">Modhuralap</h2>
          <p style="margin:0 0 16px">Use this code to verify your email address:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#faecef;border-radius:12px;padding:16px;text-align:center">${otp}</div>
          <p style="margin:16px 0 0;font-size:13px;color:#6b4a54">This code is valid for ${expiresInMinutes} minutes. If you didn't request it, you can safely ignore this email.</p>
        </div>`,
    });
  } catch (error) {
    console.error("Send OTP email failed:", error);
    // Drop the cached transporter so a bad connection isn't reused forever
    transporter = null;
    throw new AppError(
      503,
      "We couldn't send the email. Please try again in a moment"
    );
  }
}
