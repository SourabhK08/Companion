"use client";

import { cn } from "cn";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DashboardFooter } from "@/components/layout/dashboard-footer";

/**
 * Inner layout that reacts to sidebar state.
 * Separated to use the useSidebar hook inside SidebarProvider.
 */
function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-warm-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1">{children}</main>

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
    <SidebarProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </SidebarProvider>
  );
}
