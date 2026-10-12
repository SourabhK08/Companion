"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard component for protecting routes under (main).
 *
 * Rules:
 *   1. While auth state is restoring (`isLoading` = true), display a branded
 *      loading screen so NO protected content or UI flashes to guests.
 *   2. If not authenticated (`!isAuthenticated` and `!isLoading`),
 *      immediately redirect to `/login?from=<currentPath>`.
 *   3. If authenticated, render children safely.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsRedirecting(true);
      const query = searchParams?.toString();
      const returnUrl = query ? `${pathname}?${query}` : pathname;
      // Prevent loop if already on an auth page
      const destination =
        returnUrl && !returnUrl.startsWith("/login") && !returnUrl.startsWith("/signup")
          ? `/login?from=${encodeURIComponent(returnUrl)}`
          : "/login";

      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, pathname, searchParams, router]);

  // While restoring session or redirecting unauthorized guest, show branded splash
  if (isLoading || !isAuthenticated || isRedirecting) {
    return (
      <div
        className="flex min-h-screen min-h-[100dvh] w-full flex-col items-center justify-center bg-warm-white px-4 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-soft-border/80 bg-white shadow-sm sm:size-20">
          <div className="size-8 rounded-full bg-gradient-to-br from-dusty-rose via-white/80 to-berry-dark animate-pulse sm:size-10" />
          <Loader2 className="absolute size-10 animate-spin text-berry opacity-40 sm:size-12" />
        </div>
        <div className="flex flex-col items-center leading-none">
          <span className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Modhuralap
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-berry sm:text-xs">
            Companion
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          Securing your session…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
