"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ApiAuthService } from "@/lib/auth/api-auth-service";
import { SocketProvider } from "@/providers/socket-provider";
import { NotificationProvider } from "@/hooks/use-notifications";
import { ChatAccessProvider } from "@/hooks/use-chat-access";

/**
 * Composed application providers.
 *
 * Wraps children with:
 *   1. TanStack Query (QueryClientProvider)
 *   2. Auth (AuthProvider)
 *   3. Socket.IO (SocketProvider)
 *
 * The QueryClient is created once per component instance to avoid
 * sharing state across requests in SSR.
 */

/** Singleton real auth service instance. */
const authService = new ApiAuthService();

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
      <AuthProvider authService={authService}>
        <SocketProvider>
          <NotificationProvider>
            <ChatAccessProvider>{children}</ChatAccessProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
