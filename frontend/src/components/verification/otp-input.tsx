"use client";

import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "cn";

export const OTP_LENGTH = 6;

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

/**
 * 6-box one-time-code input shared by phone and email verification.
 * Supports typing, paste, backspace/arrow navigation and SMS/email autofill.
 */
export function OtpInput({ value, onChange, onComplete, disabled, hasError }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Focus the first empty box whenever the input is (re)shown or cleared
    const firstEmpty = value.findIndex((d) => !d);
    refs.current[firstEmpty === -1 ? OTP_LENGTH - 1 : firstEmpty]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join("") === ""]);

  const fill = (startIndex: number, digits: string) => {
    const next = [...value];
    let i = startIndex;
    for (const d of digits) {
      if (i >= OTP_LENGTH) break;
      next[i++] = d;
    }
    onChange(next);
    refs.current[Math.min(i, OTP_LENGTH - 1)]?.focus();
    if (next.every(Boolean)) onComplete(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...value];
      next[index] = "";
      onChange(next);
      return;
    }
    // Handles typing and autofill (iOS/Android put the full code in one box)
    fill(index, digits);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    fill(0, digits);
  };

  return (
    <div className="flex gap-1.5 sm:gap-2" role="group" aria-label="One-time password">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? OTP_LENGTH : 1}
          value={value[i]}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={hasError}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-10 sm:size-12 rounded-lg border bg-white text-center text-lg font-semibold text-foreground",
            "transition-colors focus:outline-none focus:ring-2 disabled:opacity-60",
            hasError
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-soft-border focus:border-berry focus:ring-berry/20"
          )}
        />
      ))}
    </div>
  );
}
