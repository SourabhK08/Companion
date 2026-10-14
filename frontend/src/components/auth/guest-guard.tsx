"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard component for auth routes (/login, /signup).
 *
 * Rules:
 *   1. While auth state is restoring (`isLoading` = true), display a minimal loader
 *      to avoid showing the login form before we know the user is already logged in.
 *   2. If authenticated (`isAuthenticated` = true), redirect to `from` or `/dashboard`.
 *   3. If guest (`!isAuthenticated`), render the auth forms safely.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setIsRedirecting(true);
      const from = searchParams?.get("from");
      const target =
        from &&
        from.startsWith("/") &&
        !from.startsWith("//") &&
        !from.startsWith("/login") &&
        !from.startsWith("/signup")
          ? from
          : "/dashboard";
      router.replace(target);
    }
  }, [isAuthenticated, isLoading, searchParams, router]);

  if (isLoading || isAuthenticated || isRedirecting) {
    return (
      <div
        className="flex min-h-screen min-h-[100dvh] w-full flex-col items-center justify-center bg-deep-plum px-4 text-center text-white"
        role="status"
        aria-live="polite"
      >
        <div className="relative mb-4 flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:size-16">
          <div className="size-7 rounded-full bg-gradient-to-br from-dusty-rose via-white/80 to-berry-dark sm:size-8" />
          <Loader2 className="absolute size-9 animate-spin text-white/50 sm:size-11" />
        </div>
        <p className="text-xs text-white/70 sm:text-sm">
          {isAuthenticated || isRedirecting
            ? "Taking you to your dashboard…"
            : "Checking session…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
