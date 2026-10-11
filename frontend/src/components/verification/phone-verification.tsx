"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Pencil,
  Phone,
  RotateCw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "cn";

import { usePhoneVerification } from "@/hooks/use-verification";
import { OtpInput, OTP_LENGTH, formatSeconds } from "./otp-input";

const PHONE_REGEX = /^(\+?91)?[6-9]\d{9}$/;

/** "9876543210" | "+919876543210" → "9876543210" */
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91")) return cleaned.slice(3);
  if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned.slice(2);
  return cleaned;
}

/** "9876543210" → "+91 98765 43210" */
function formatPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : phone;
}

/** "9876543210" → "+91 ••••• •3210" (shown on the OTP screen) */
function maskPhone(phone: string): string {
  const p = normalizePhone(phone);
  return p.length === 10 ? `+91 ••••• •${p.slice(6)}` : phone;
}

// ─── Main component ──────────────────────────────────────

type Mode = "view" | "edit" | "otp";

export interface PhoneVerificationProps {
  /** Current phone on the user's account (may be unverified). */
  phone?: string | null;
  isPhoneVerified: boolean;
  /** Called after a successful verification — should refresh the auth user. */
  onVerified: () => void | Promise<void>;
  className?: string;
}

/**
 * Phone number row with built-in OTP verification.
 *
 * States:
 *   view  → shows number + Verified / Not verified status
 *   edit  → enter or change number, then "Send OTP"
 *   otp   → 6-box code entry, expiry countdown, resend cooldown
 *
 * Changing an already-verified number keeps the old verification until the
 * new number is verified — the backend only swaps the number on success.
 */
export function PhoneVerification({
  phone,
  isPhoneVerified,
  onVerified,
  className,
}: PhoneVerificationProps) {
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
  } = usePhoneVerification();

  const [mode, setMode] = useState<Mode>("view");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneInputError, setPhoneInputError] = useState<string | null>(null);
  const [targetPhone, setTargetPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [justVerified, setJustVerified] = useState(false);

  const clearOtp = useCallback(() => setOtp(Array(OTP_LENGTH).fill("")), []);

  // Hide the success banner after a few seconds
  useEffect(() => {
    if (!justVerified) return;
    const t = setTimeout(() => setJustVerified(false), 4000);
    return () => clearTimeout(t);
  }, [justVerified]);

  const startEdit = () => {
    reset();
    setPhoneInput(phone ? normalizePhone(phone) : "");
    setPhoneInputError(null);
    setMode("edit");
  };

  const cancel = () => {
    reset();
    clearOtp();
    setPhoneInputError(null);
    setMode("view");
  };

  const requestOtp = async (rawPhone: string) => {
    const normalized = normalizePhone(rawPhone);
    if (!PHONE_REGEX.test(normalized)) {
      setPhoneInputError("Enter a valid 10-digit Indian mobile number");
      setMode("edit");
      setPhoneInput(normalized);
      return;
    }
    if (isPhoneVerified && phone && normalizePhone(phone) === normalized) {
      setPhoneInputError("This number is already verified");
      return;
    }
    setPhoneInputError(null);
    clearOtp();
    const ok = await sendOtp(normalized);
    if (ok) {
      setTargetPhone(normalized);
      setMode("otp");
    }
  };

  const submitOtp = async (code: string) => {
    if (code.length !== OTP_LENGTH || isVerifying) return;
    const ok = await verifyOtp(targetPhone, code);
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
    await sendOtp(targetPhone);
  };

  const otpExpired = mode === "otp" && expiresIn === 0;

  return (
    <div className={cn("py-3.5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
            <Phone className="size-4.5" />
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted-foreground sm:text-sm">
              Phone Number
            </span>

            {mode !== "edit" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {phone ? formatPhone(phone) : "Not added"}
                </span>
                {phone &&
                  (isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 sm:text-xs">
                      <BadgeCheck className="size-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:text-xs">
                      <ShieldAlert className="size-3.5" />
                      Not verified
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {mode === "view" && (
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            {phone && !isPhoneVerified && (
              <button
                type="button"
                onClick={() => requestOtp(phone)}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-berry px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60 sm:text-sm"
              >
                {isSending && <Loader2 className="size-3.5 animate-spin" />}
                Verify
              </button>
            )}
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-berry hover:text-berry sm:text-sm"
            >
              <Pencil className="size-3.5 text-berry" />
              {phone ? "Change" : "Add"}
            </button>
          </div>
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
          Phone number verified successfully
        </p>
      )}

      {/* ─── Edit: enter number ─── */}
      {mode === "edit" && (
        <form
          className="mt-3 space-y-2 sm:pl-12"
          onSubmit={(e) => {
            e.preventDefault();
            requestOtp(phoneInput);
          }}
          noValidate
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div
              className={cn(
                "flex h-10 flex-1 items-center overflow-hidden rounded-lg border bg-white focus-within:ring-2",
                phoneInputError || error
                  ? "border-destructive focus-within:ring-destructive/20"
                  : "border-soft-border focus-within:border-berry focus-within:ring-berry/20"
              )}
            >
              <span className="flex h-full items-center border-r border-soft-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                autoFocus
                maxLength={14}
                placeholder="10-digit mobile number"
                value={phoneInput}
                disabled={isSending}
                aria-label="Mobile number"
                aria-invalid={!!(phoneInputError || error)}
                onChange={(e) => {
                  setPhoneInput(e.target.value.replace(/[^\d+\s-]/g, ""));
                  setPhoneInputError(null);
                  clearError();
                }}
                className="h-full min-w-0 flex-1 px-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none sm:text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSending || !phoneInput.trim()}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-berry px-4 text-sm font-semibold text-white transition-colors hover:bg-berry-dark disabled:opacity-60 sm:flex-none"
              >
                {isSending && <Loader2 className="size-4 animate-spin" />}
                Send OTP
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={isSending}
                className="h-10 rounded-lg border border-soft-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
          {(phoneInputError || error) && (
            <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="mt-px size-3.5 shrink-0" />
              {phoneInputError ?? error?.message}
            </p>
          )}
          {isPhoneVerified && (
            <p className="text-xs text-muted-foreground">
              Your current number stays verified until the new one is confirmed.
            </p>
          )}
        </form>
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
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-foreground">{maskPhone(targetPhone)}</span>
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

            <button
              type="button"
              onClick={startEdit}
              disabled={isVerifying}
              className="font-semibold text-muted-foreground hover:text-foreground"
            >
              Change number
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
