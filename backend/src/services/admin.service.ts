import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "./auth.service.js";
import { resolveAvatars } from "./cloudinary.service.js";

/**
 * Constant-time string comparison to prevent timing attacks on credentials.
 */
function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Compare against self to keep constant time even on length mismatch
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ─── Admin Login ──────────────────────────────────────────

export function adminLogin(inputUsername: string, inputPassword: string) {
  const isUsernameMatch = secureCompare(inputUsername.trim(), env.ADMIN_USERNAME);
  const isPasswordMatch = secureCompare(inputPassword, env.ADMIN_PASSWORD);

  if (!isUsernameMatch || !isPasswordMatch) {
    throw new AppError(401, "Invalid admin username or password");
  }

  // Generate an admin session token valid for 12 hours
  const token = jwt.sign(
    {
      role: "admin",
      isAdmin: true,
      username: env.ADMIN_USERNAME,
    },
    env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return {
    token,
    admin: {
      username: env.ADMIN_USERNAME,
      role: "admin",
    },
  };
}

// ─── App Reviews Moderation ───────────────────────────────

export async function getAllAppReviews() {
  const reviews = await prisma.appReview.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      rating: true,
      comment: true,
      isApproved: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          city: true,
        },
      },
    },
  });

  const resolved = resolveAvatars(reviews);

  const pending = resolved.filter((r) => !r.isApproved);
  const approved = resolved.filter((r) => r.isApproved);

  const total = resolved.length;
  const avgRating =
    total > 0
      ? Math.round(
          (resolved.reduce((sum, r) => sum + r.rating, 0) / total) * 10
        ) / 10
      : 5.0;

  return {
    all: resolved,
    pending,
    approved,
    stats: {
      total,
      pendingCount: pending.length,
      approvedCount: approved.length,
      averageRating: avgRating,
    },
  };
}

export async function approveAppReview(id: string) {
  const review = await prisma.appReview.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "App review not found");
  }

  const updated = await prisma.appReview.update({
    where: { id },
    data: { isApproved: true },
    select: {
      id: true,
      userId: true,
      rating: true,
      comment: true,
      isApproved: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function rejectAppReview(id: string) {
  const review = await prisma.appReview.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "App review not found");
  }

  const updated = await prisma.appReview.update({
    where: { id },
    data: { isApproved: false },
    select: {
      id: true,
      userId: true,
      rating: true,
      comment: true,
      isApproved: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function deleteAppReview(id: string) {
  const review = await prisma.appReview.findUnique({ where: { id } });
  if (!review) {
    throw new AppError(404, "App review not found");
  }

  await prisma.appReview.delete({ where: { id } });

  return { id };
}
