"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { MockAuthService } from "@/lib/auth/mock-auth-service";

/**
 * Composed application providers.
 *
 * Wraps children with:
 *   1. TanStack Query (QueryClientProvider)
 *   2. Auth (AuthProvider)
 *
 * The QueryClient is created once per component instance to avoid
 * sharing state across requests in SSR.
 */

/** Singleton mock auth service instance. */
const authService = new MockAuthService();

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus during development.
            refetchOnWindowFocus: false,
            // Retry once on failure.
            retry: 1,
            // Cache for 5 minutes.
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authService={authService}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
