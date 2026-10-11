"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, CheckCircle2, Circle, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "cn";

import { useAuth } from "@/hooks/use-auth";
import { PhoneVerification } from "@/components/verification/phone-verification";
import { EmailVerification } from "@/components/verification/email-verification";

/**
 * Post-signup account verification step.
 *
 * The verified badge needs BOTH phone and email to be verified, so this page
 * shows both with a progress indicator.
 *  - Fully-verified users are sent straight to the dashboard
 *  - "Skip for now" is always available (can finish later in Settings)
 */
export default function VerifyAccountPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();

  const phoneDone = !!user?.isPhoneVerified;
  const emailDone = !!user?.isEmailVerified;
  const doneCount = Number(phoneDone) + Number(emailDone);
  const allDone = phoneDone && emailDone;

  useEffect(() => {
    if (!isLoading && allDone) {
      // Brief pause so the user sees the success state before leaving
      const t = setTimeout(() => router.replace("/dashboard"), 1500);
      return () => clearTimeout(t);
    }
  }, [isLoading, allDone, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-berry" />
      </div>
    );
  }

  const steps = [
    { label: "Phone", done: phoneDone },
    { label: "Email", done: emailDone },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs sm:p-7">
        <div className="flex size-12 items-center justify-center rounded-full bg-berry/10 ring-1 ring-berry/20">
          <ShieldCheck className="size-6 text-berry" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
          Verify your account
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Verify both your phone number and email to earn the{" "}
          <span className="inline-flex items-center gap-0.5 font-semibold text-sky-600">
            <BadgeCheck className="size-4" /> verified badge
          </span>{" "}
          on your profile. It&apos;s a one-time check that keeps Modhuralap safe.
        </p>

        {/* Progress */}
        <div className="mt-5 flex items-center gap-3" aria-label={`${doneCount} of 2 verified`}>
          {steps.map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold",
                s.done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-soft-border bg-white text-muted-foreground"
              )}
            >
              {s.done ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <Circle className="size-4 shrink-0" />
              )}
              {s.label}
            </div>
          ))}
        </div>

        {allDone && (
          <p role="status" className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <BadgeCheck className="size-4" />
            You&apos;re verified! Taking you to your dashboard…
          </p>
        )}

        <div className="mt-4 divide-y divide-soft-border/70 rounded-xl border border-soft-border/80 px-4">
          <PhoneVerification
            phone={user.phone}
            isPhoneVerified={phoneDone}
            onVerified={() => refreshUser()}
          />
          <EmailVerification
            email={user.email}
            isEmailVerified={emailDone}
            onVerified={() => refreshUser()}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            You can also do this later in Settings.
          </p>
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {allDone ? "Continue" : "Skip for now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
