import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Auth service — all authentication business logic.
 *
 * No HTTP knowledge here. Controllers handle request/response;
 * this service handles hashing, tokens, and DB operations.
 */

// ─── Helpers ──────────────────────────────────────────────

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function sanitizeUser(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  city: string | null;
  avatar: string | null;
  isVerified: boolean;
  authProvider: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    city: user.city,
    avatar: user.avatar,
    isVerified: user.isVerified,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
  };
}

// ─── Register ─────────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone ?? null,
      city: input.city ?? null,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

// ─── Login ────────────────────────────────────────────────

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError(401, "Invalid email or password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

// ─── Refresh ──────────────────────────────────────────────

export async function refreshAccessToken(refreshTokenValue: string) {
  // Find the refresh token in DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError(401, "Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError(401, "Refresh token expired — please login again");
  }

  // Token rotation: delete old token, create new one
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newAccessToken = generateAccessToken(storedToken.userId);
  const newRefreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user: sanitizeUser(storedToken.user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

// ─── Logout ───────────────────────────────────────────────

export async function logoutUser(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) return;

  // Delete the specific refresh token (revoke it)
  await prisma.refreshToken
    .delete({ where: { token: refreshTokenValue } })
    .catch(() => {
      // Token might not exist (already revoked / expired) — that's fine
    });
}

// ─── Get Current User ─────────────────────────────────────

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return sanitizeUser(user);
}

// ─── Custom Error Class ───────────────────────────────────

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
