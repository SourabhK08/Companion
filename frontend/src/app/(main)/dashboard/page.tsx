"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

/**
 * Placeholder authenticated dashboard page.
 *
 * Purpose: Demonstrates the auth flow works end-to-end:
 *   Login → redirect → authenticated page → logout → redirect back
 *
 * This will be replaced with the real discovery feed in Phase 3.
 */
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-berry" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-2xl border border-soft-border bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name ?? "User"}! 👋
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re logged in as{" "}
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>

        <div className="mt-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          ⚠️ This is a development placeholder. The real dashboard will come in Phase 3.
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="mt-8 h-11 rounded-xl border-soft-border px-8 text-sm font-medium"
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
