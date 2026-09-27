import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  AppError,
} from "../services/auth.service.js";

const REFRESH_COOKIE_NAME = "modhuralap_refresh_token";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Set the refresh token as an httpOnly cookie.
 * httpOnly means JavaScript (and XSS attacks) CANNOT read this cookie.
 * It's sent automatically by the browser with every request to our domain.
 */
function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/",
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

// ─── POST /api/auth/register ──────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerUser(req.body);

    setRefreshCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

// ─── POST /api/auth/login ─────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginUser(req.body);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

// ─── POST /api/auth/refresh ───────────────────────────────

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    // Token rotation: set new refresh cookie
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    // On any refresh error, clear the cookie
    clearRefreshCookie(res);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}

// ─── POST /api/auth/logout ────────────────────────────────

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await logoutUser(refreshToken);

    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if something goes wrong, clear the cookie
    clearRefreshCookie(res);
    res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await getCurrentUser(req.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error("Me error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
}
