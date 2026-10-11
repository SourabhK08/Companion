"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Mail,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "cn";

import { useEmailVerification } from "@/hooks/use-verification";
import { OtpInput, OTP_LENGTH, formatSeconds } from "./otp-input";

/** "sourabh@gmail.com" → "so•••••@gmail.com" (shown on the OTP screen) */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

type Mode = "view" | "otp";

export interface EmailVerificationProps {
  /** The account email (this is the address that gets verified). */
  email: string;
  isEmailVerified: boolean;
  /** Called after a successful verification — should refresh the auth user. */
  onVerified: () => void | Promise<void>;
  className?: string;
}

/**
 * Email row with built-in OTP verification.
 *
 * The account email is the login identifier, so it can't be edited here —
 * only verified. States: view → otp → view (verified).
 */
export function EmailVerification({
  email,
  isEmailVerified,
  onVerified,
  className,
}: EmailVerificationProps) {
  const {
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
  } = useEmailVerification();

  const [mode, setMode] = useState<Mode>("view");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [justVerified, setJustVerified] = useState(false);

  const clearOtp = useCallback(() => setOtp(Array(OTP_LENGTH).fill("")), []);

  // Hide the success banner after a few seconds
  useEffect(() => {
    if (!justVerified) return;
    const t = setTimeout(() => setJustVerified(false), 4000);
    return () => clearTimeout(t);
  }, [justVerified]);

  const requestOtp = async () => {
    clearOtp();
    const ok = await sendOtp();
    if (ok) setMode("otp");
  };

  const cancel = () => {
    reset();
    clearOtp();
    setMode("view");
  };

  const submitOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH || isVerifying) return;
    const ok = await verifyOtp("", code);
    if (ok) {
      clearOtp();
      setMode("view");
      setJustVerified(true);
      await onVerified();
    } else {
      // Wrong / expired / locked → clear boxes so the user can retype
      clearOtp();
    }
  };

  const resend = async () => {
    if (resendIn > 0 || isSending) return;
    clearOtp();
    await sendOtp();
  };

  const otpExpired = mode === "otp" && expiresIn === 0;

  return (
    <div className={cn("py-3.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
            <Mail className="size-4.5" />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted-foreground sm:text-sm">
              Email Address
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all text-sm font-semibold text-foreground sm:text-base">
                {email}
              </span>
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 sm:text-xs">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:text-xs">
                  <ShieldAlert className="size-3.5" />
                  Not verified
                </span>
              )}
            </div>
          </div>
        </div>

        {mode === "view" && !isEmailVerified && (
          <button
            type="button"
            onClick={requestOtp}
            disabled={isSending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-berry px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60 sm:text-sm"
          >
            {isSending && <Loader2 className="size-3.5 animate-spin" />}
            Verify
          </button>
        )}
      </div>

      {/* Errors from "view" mode (e.g. Verify clicked but send failed) */}
      {mode === "view" && error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 pl-12 text-xs text-destructive">
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          {error.message}
        </p>
      )}

      {mode === "view" && justVerified && (
        <p role="status" className="mt-2 flex items-center gap-1.5 pl-12 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="size-3.5" />
          Email verified successfully
        </p>
      )}

      {/* ─── OTP entry ─── */}
      {mode === "otp" && (
        <form
          className="mt-3 space-y-3 sm:pl-12"
          onSubmit={(e) => {
            e.preventDefault();
            submitOtp(otp.join(""));
          }}
          noValidate
        >
          <p className="text-xs text-muted-foreground sm:text-sm">
            Enter the 6-digit code we emailed to{" "}
            <span className="break-all font-semibold text-foreground">{maskEmail(email)}</span>.
            <span className="block text-[11px] sm:text-xs">
              Can&apos;t find it? Check your spam folder.
            </span>
          </p>

          <OtpInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              if (error) clearError();
            }}
            onComplete={submitOtp}
            disabled={isVerifying || otpExpired}
            hasError={!!error}
          />

          {devOtp && (
            <p className="inline-block rounded-md border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
              Dev mode OTP: <span className="font-mono font-bold tracking-widest">{devOtp}</span>
            </p>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="mt-px size-3.5 shrink-0" />
              {error.message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <span className={cn("font-medium", otpExpired ? "text-destructive" : "text-muted-foreground")}>
              {otpExpired ? "Code expired" : `Expires in ${formatSeconds(expiresIn)}`}
            </span>

            <button
              type="button"
              onClick={resend}
              disabled={resendIn > 0 || isSending || isVerifying}
              className="inline-flex items-center gap-1 font-semibold text-berry disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {isSending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RotateCw className="size-3.5" />
              )}
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isVerifying || otpExpired || otp.some((d) => !d)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-berry px-5 text-sm font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60 sm:flex-none"
            >
              {isVerifying && <Loader2 className="size-4 animate-spin" />}
              {isVerifying ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={isVerifying}
              className="h-10 rounded-lg border border-soft-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
