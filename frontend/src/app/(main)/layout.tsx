"use client";

import { Suspense } from "react";
import { cn } from "cn";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardFooter } from "@/components/layout/dashboard-footer";
import { AuthGuard } from "@/components/auth/auth-guard";

/**
 * Inner layout that reacts to sidebar state.
 * Separated to use the useSidebar hook inside SidebarProvider.
 */
function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-warm-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-1 flex-col w-full min-w-0 max-w-full overflow-x-hidden transition-all duration-300",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden">{children}</main>

        {/* Footer on every page */}
        <DashboardFooter />
      </div>
    </div>
  );
}

/**
 * Main layout for authenticated routes (/dashboard, /profile, etc.)
 *
 * Structure:
 *   - AuthGuard: checks authentication and redirects unauthenticated users to /login?from=...
 *   - Left: Collapsible sidebar (desktop) / Sheet (mobile)
 *   - Top: Search bar + city + notifications + user
 *   - Center: Page content
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <AuthGuard>
        <SidebarProvider>
          <MainLayoutInner>{children}</MainLayoutInner>
        </SidebarProvider>
      </AuthGuard>
    </Suspense>
  );
}
