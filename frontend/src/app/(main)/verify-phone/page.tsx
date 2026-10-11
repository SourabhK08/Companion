"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { PhoneVerification } from "@/components/verification/phone-verification";

/**
 * Post-signup phone verification step.
 *
 * - Pre-filled with the number entered at signup
 * - Already-verified users are sent straight to the dashboard
 * - "Skip for now" is always available (can verify later in Settings)
 */
export default function VerifyPhonePage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.isPhoneVerified) {
      router.replace("/dashboard");
    }
  }, [isLoading, user?.isPhoneVerified, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-berry" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs sm:p-7">
        <div className="flex size-12 items-center justify-center rounded-full bg-berry/10 ring-1 ring-berry/20">
          <ShieldCheck className="size-6 text-berry" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
          Verify your phone number
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          A quick one-time check that keeps Modhuralap safe. Verified members get a{" "}
          <span className="inline-flex items-center gap-0.5 font-semibold text-sky-600">
            <BadgeCheck className="size-4" /> badge
          </span>{" "}
          on their profile and more trust from the community.
        </p>

        <div className="mt-5 rounded-xl border border-soft-border/80 px-4">
          <PhoneVerification
            phone={user.phone}
            isPhoneVerified={!!user.isPhoneVerified}
            onVerified={async () => {
              await refreshUser();
              router.replace("/dashboard");
            }}
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
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
