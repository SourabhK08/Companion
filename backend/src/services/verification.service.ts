import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "./auth.service.js";
import { env } from "../config/env.js";
import { normalizePhone } from "../lib/phone.js";
import { isEmailConfigured, sendOtpEmail } from "./email.service.js";

// ─── Constants ────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS_PER_OTP = 5;
const MAX_OTPS_PER_HOUR = 3;
const MAX_OTPS_PER_DAY = 5;
const BCRYPT_SALT_ROUNDS = 10;
/** Must stay > 24h, because the daily rate limit counts rows from the last 24h. */
const OTP_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt for uniform distribution (no modulo bias).
 */
function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1); // 100000
  const max = Math.pow(10, OTP_LENGTH); // 1000000
  return crypto.randomInt(min, max).toString();
}

/**
 * THE badge rule: a user is "verified" only when BOTH phone and email are verified.
 *
 * `isVerified` is derived — never set it directly. Call this inside the same
 * transaction that changes isPhoneVerified / isEmailVerified.
 */
export async function recomputeIsVerified(
  tx: Prisma.TransactionClient,
  userId: string
) {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { isPhoneVerified: true, isEmailVerified: true },
  });
  return tx.user.update({
    where: { id: userId },
    data: { isVerified: user.isPhoneVerified && user.isEmailVerified },
    select: {
      id: true,
      phone: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      isVerified: true,
    },
  });
}

/** Delete OTP rows old enough that they can't affect rate limits any more. */
async function cleanupOldOtps(userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - OTP_RETENTION_MS);
  try {
    await Promise.all([
      prisma.phoneOtp.deleteMany({ where: { userId, createdAt: { lt: cutoff } } }),
      prisma.emailOtp.deleteMany({ where: { userId, createdAt: { lt: cutoff } } }),
    ]);
  } catch (error) {
    // Cleanup is best-effort; never block the user's request on it.
    console.error("OTP cleanup failed:", error);
  }
}

// ─── Send Phone OTP ───────────────────────────────────────

export async function sendPhoneOtp(userId: string, rawPhone: string) {
  const phone = normalizePhone(rawPhone);

  // 1. Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isPhoneVerified: true, phone: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2. Check if this user's phone is already verified with same number
  if (user.isPhoneVerified && user.phone === phone) {
    throw new AppError(409, "This phone number is already verified");
  }

  // 3. Check if phone is already verified by another user
  const phoneInUse = await prisma.user.findFirst({
    where: {
      phone,
      isPhoneVerified: true,
      id: { not: userId },
    },
    select: { id: true },
  });

  if (phoneInUse) {
    throw new AppError(
      409,
      "This phone number is already verified by another account"
    );
  }

  // 4. Rate limiting — max OTPs per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const otpsLastHour = await prisma.phoneOtp.count({
    where: {
      userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (otpsLastHour >= MAX_OTPS_PER_HOUR) {
    throw new AppError(
      429,
      "Too many OTP requests. Please try again after some time"
    );
  }

  // 5. Rate limiting — max OTPs per day
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const otpsLastDay = await prisma.phoneOtp.count({
    where: {
      userId,
      createdAt: { gte: oneDayAgo },
    },
  });

  if (otpsLastDay >= MAX_OTPS_PER_DAY) {
    throw new AppError(
      429,
      "Daily OTP limit reached. Please try again tomorrow"
    );
  }

  // 6. Invalidate all previous unused OTPs for this user
  await prisma.phoneOtp.updateMany({
    where: {
      userId,
      isUsed: false,
    },
    data: {
      isUsed: true, // Mark as used so they can't be verified
    },
  });

  // 7. Generate OTP and hash it
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);

  // 8. Store OTP in database
  await prisma.phoneOtp.create({
    data: {
      userId,
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  void cleanupOldOtps(userId);

  // 9. Send OTP via SMS
  // In development: return OTP in response for testing
  // In production: integrate Twilio/MSG91/AWS SNS here
  if (env.NODE_ENV === "development") {
    console.log(`📱 [DEV] OTP for ${phone}: ${otp}`);
    return {
      message: "OTP sent successfully",
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      // Only in development — never expose in production!
      devOtp: otp,
    };
  }

  // TODO: Production SMS sending
  // await sendSms(phone, `Your Modhuralap verification OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);

  return {
    message: "OTP sent successfully",
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
  };
}

// ─── Verify Phone OTP ─────────────────────────────────────

export async function verifyPhoneOtp(
  userId: string,
  rawPhone: string,
  otp: string
) {
  const phone = normalizePhone(rawPhone);

  // 1. Find the latest unused OTP for this user + phone
  const otpRecord = await prisma.phoneOtp.findFirst({
    where: {
      userId,
      phone,
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new AppError(
      400,
      "No pending OTP found. Please request a new OTP"
    );
  }

  // 2. Check if OTP is expired
  if (otpRecord.expiresAt < new Date()) {
    await prisma.phoneOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new AppError(410, "OTP has expired. Please request a new one");
  }

  // 3. Check max attempts
  if (otpRecord.attempts >= MAX_ATTEMPTS_PER_OTP) {
    await prisma.phoneOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new AppError(
      423,
      "Too many failed attempts. Please request a new OTP"
    );
  }

  // 4. Compare OTP hash
  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

  if (!isMatch) {
    await prisma.phoneOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const remainingAttempts =
      MAX_ATTEMPTS_PER_OTP - (otpRecord.attempts + 1);

    if (remainingAttempts <= 0) {
      await prisma.phoneOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new AppError(
        423,
        "Too many failed attempts. Please request a new OTP"
      );
    }

    throw new AppError(
      400,
      `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining`
    );
  }

  // 5. OTP matched! Update everything in a transaction
  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.phoneOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Invalidate all other unused OTPs for this user
    await tx.phoneOtp.updateMany({
      where: {
        userId,
        isUsed: false,
        id: { not: otpRecord.id },
      },
      data: { isUsed: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: { phone, isPhoneVerified: true },
    });

    // Badge only if the email is ALSO verified
    return recomputeIsVerified(tx, userId);
  });

  return {
    message: "Phone number verified successfully",
    user: updatedUser,
  };
}

// ─── Send Email OTP ───────────────────────────────────────

export async function sendEmailOtp(userId: string) {
  // 1. Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isEmailVerified: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2. Already verified — one-time process
  if (user.isEmailVerified) {
    throw new AppError(409, "Your email address is already verified");
  }

  const email = user.email.toLowerCase();

  // 3. Rate limiting — per hour / per day
  const now = Date.now();
  const [otpsLastHour, otpsLastDay] = await Promise.all([
    prisma.emailOtp.count({
      where: { userId, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    }),
    prisma.emailOtp.count({
      where: { userId, createdAt: { gte: new Date(now - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  if (otpsLastHour >= MAX_OTPS_PER_HOUR) {
    throw new AppError(
      429,
      "Too many OTP requests. Please try again after some time"
    );
  }
  if (otpsLastDay >= MAX_OTPS_PER_DAY) {
    throw new AppError(
      429,
      "Daily OTP limit reached. Please try again tomorrow"
    );
  }

  // 4. Invalidate previous unused OTPs
  await prisma.emailOtp.updateMany({
    where: { userId, isUsed: false },
    data: { isUsed: true },
  });

  // 5. Generate + store hashed OTP
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);

  const record = await prisma.emailOtp.create({
    data: {
      userId,
      email,
      otpHash,
      expiresAt: new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  void cleanupOldOtps(userId);

  const isDev = env.NODE_ENV === "development";

  // 6. Deliver. In dev with no SMTP configured we skip delivery and return devOtp.
  if (!isDev || isEmailConfigured()) {
    try {
      await sendOtpEmail(email, otp, OTP_EXPIRY_MINUTES);
    } catch (error) {
      // Delivery failed: remove this OTP so it doesn't burn the user's rate limit
      // or leave a dead code behind, then surface the error.
      await prisma.emailOtp
        .delete({ where: { id: record.id } })
        .catch(() => undefined);
      throw error;
    }
  }

  if (isDev) {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    return {
      message: "OTP sent successfully",
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      email,
      // Only in development — never expose in production!
      devOtp: otp,
    };
  }

  return {
    message: "OTP sent successfully",
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    email,
  };
}

// ─── Verify Email OTP ─────────────────────────────────────

export async function verifyEmailOtp(userId: string, otp: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isEmailVerified: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.isEmailVerified) {
    throw new AppError(409, "Your email address is already verified");
  }

  const otpRecord = await prisma.emailOtp.findFirst({
    where: { userId, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new AppError(
      400,
      "No pending OTP found. Please request a new OTP"
    );
  }

  if (otpRecord.expiresAt < new Date()) {
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new AppError(410, "OTP has expired. Please request a new one");
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS_PER_OTP) {
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new AppError(
      423,
      "Too many failed attempts. Please request a new OTP"
    );
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

  if (!isMatch) {
    await prisma.emailOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const remainingAttempts =
      MAX_ATTEMPTS_PER_OTP - (otpRecord.attempts + 1);

    if (remainingAttempts <= 0) {
      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      throw new AppError(
        423,
        "Too many failed attempts. Please request a new OTP"
      );
    }

    throw new AppError(
      400,
      `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining`
    );
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.emailOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    await tx.emailOtp.updateMany({
      where: { userId, isUsed: false, id: { not: otpRecord.id } },
      data: { isUsed: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    // Badge only if the phone is ALSO verified
    return recomputeIsVerified(tx, userId);
  });

  return {
    message: "Email verified successfully",
    user: updatedUser,
  };
}

// ─── Get Verification Status ──────────────────────────────

export async function getVerificationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      phone: true,
      isPhoneVerified: true,
      isEmailVerified: true,
      isVerified: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    phone: user.phone,
    isPhoneVerified: user.isPhoneVerified,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    isVerified: user.isVerified,
  };
}
