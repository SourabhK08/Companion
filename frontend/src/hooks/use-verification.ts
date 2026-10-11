"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

/** Seconds the user must wait before requesting another OTP. */
export const RESEND_COOLDOWN_SECONDS = 30;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface SendOtpData {
  expiresInSeconds: number;
  devOtp?: string;
}

export type OtpErrorKind =
  | "validation" // bad phone / OTP format, or wrong OTP (400)
  | "conflict" // already verified / number used by another account (409)
  | "expired" // OTP expired (410)
  | "locked" // too many wrong attempts (423)
  | "rate_limited" // too many OTP requests (429)
  | "auth" // session expired (401)
  | "unavailable" // email/SMS provider down (503)
  | "network" // offline / server unreachable
  | "server"; // anything else

export interface OtpError {
  kind: OtpErrorKind;
  message: string;
}

/** Turn any thrown value into a user-friendly, categorised error. */
function toOtpError(error: unknown, fallback: string): OtpError {
  if (error instanceof ApiError) {
    const kindByStatus: Record<number, OtpErrorKind> = {
      400: "validation",
      401: "auth",
      409: "conflict",
      410: "expired",
      423: "locked",
      429: "rate_limited",
      503: "unavailable",
    };
    const kind = kindByStatus[error.status] ?? "server";
    const message =
      kind === "auth"
        ? "Your session has expired. Please log in again."
        : kind === "server"
          ? fallback
          : error.message;
    return { kind, message };
  }
  // fetch() rejects with TypeError when offline / CORS / server down
  if (error instanceof TypeError) {
    return {
      kind: "network",
      message: "Network error. Check your internet connection and try again.",
    };
  }
  return { kind: "server", message: fallback };
}

interface OtpFlowConfig {
  sendUrl: string;
  verifyUrl: string;
  /** Body for the send request (target = phone number; ignored for email). */
  sendBody: (target: string) => Record<string, unknown>;
  /** Body for the verify request. */
  verifyBody: (target: string, otp: string) => Record<string, unknown>;
}

/**
 * Generic OTP flow shared by phone and email verification.
 *
 * Handles API calls, loading flags, categorised errors, the OTP expiry
 * countdown and the resend cooldown. All timers are cleaned up on unmount.
 */
function useOtpFlow(config: OtpFlowConfig) {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<OtpError | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against double-submits (e.g. auto-submit + Enter key)
  const inFlightRef = useRef(false);
  // Keep latest config without re-creating callbacks every render
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (expirySeconds: number) => {
      stopTimer();
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setExpiresIn(expirySeconds);
      timerRef.current = setInterval(() => {
        setResendIn((s) => (s > 0 ? s - 1 : 0));
        setExpiresIn((s) => {
          if (s <= 1) {
            stopTimer();
            setResendIn(0);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [stopTimer]
  );

  useEffect(() => stopTimer, [stopTimer]);

  const clearError = useCallback(() => setError(null), []);

  const sendOtp = useCallback(
    async (target: string = ""): Promise<boolean> => {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setIsSending(true);
      setError(null);
      try {
        const res = await apiFetch<ApiResponse<SendOtpData>>(
          configRef.current.sendUrl,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(configRef.current.sendBody(target)),
          }
        );
        startTimer(res.data?.expiresInSeconds ?? 300);
        setDevOtp(res.data?.devOtp ?? null);
        return true;
      } catch (err) {
        setError(toOtpError(err, "Couldn't send OTP. Please try again."));
        return false;
      } finally {
        setIsSending(false);
        inFlightRef.current = false;
      }
    },
    [startTimer]
  );

  const verifyOtp = useCallback(
    async (target: string, otp: string): Promise<boolean> => {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setIsVerifying(true);
      setError(null);
      try {
        await apiFetch<ApiResponse<unknown>>(configRef.current.verifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configRef.current.verifyBody(target, otp)),
        });
        stopTimer();
        setExpiresIn(0);
        setResendIn(0);
        setDevOtp(null);
        return true;
      } catch (err) {
        const otpError = toOtpError(err, "Couldn't verify OTP. Please try again.");
        // Expired / locked OTPs are dead — allow an immediate resend
        if (otpError.kind === "expired" || otpError.kind === "locked") {
          stopTimer();
          setExpiresIn(0);
          setResendIn(0);
        }
        setError(otpError);
        return false;
      } finally {
        setIsVerifying(false);
        inFlightRef.current = false;
      }
    },
    [stopTimer]
  );

  const reset = useCallback(() => {
    stopTimer();
    setError(null);
    setResendIn(0);
    setExpiresIn(0);
    setDevOtp(null);
  }, [stopTimer]);

  return {
    sendOtp,
    verifyOtp,
    reset,
    clearError,
    isSending,
    isVerifying,
    error,
    resendIn,
    expiresIn,
    devOtp,
  };
}

/** Phone OTP verification. `sendOtp(phone)` / `verifyOtp(phone, otp)`. */
export function usePhoneVerification() {
  return useOtpFlow({
    sendUrl: "/api/verification/phone/send-otp",
    verifyUrl: "/api/verification/phone/verify-otp",
    sendBody: (phone) => ({ phone }),
    verifyBody: (phone, otp) => ({ phone, otp }),
  });
}

/**
 * Email OTP verification for the account email.
 * `sendOtp()` / `verifyOtp("", otp)` — the server always uses the account email.
 */
export function useEmailVerification() {
  return useOtpFlow({
    sendUrl: "/api/verification/email/send-otp",
    verifyUrl: "/api/verification/email/verify-otp",
    sendBody: () => ({}),
    verifyBody: (_target, otp) => ({ otp }),
  });
}
