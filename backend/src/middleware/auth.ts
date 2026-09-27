import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Extended Express Request with authenticated user ID.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * JWT authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches `userId` to the request.
 *
 * Usage:
 *   router.get("/me", authenticate, controller.me);
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
}
