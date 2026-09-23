"use client";

import Link from "next/link";
import { Bell, MessageSquare, MapPin, Search, ChevronDown, BadgeCheck } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { MobileSidebarTrigger } from "@/components/layout/sidebar";
import { useSidebar } from "@/components/layout/sidebar";
import { mockUser } from "@/config/dashboard-data";

/**
 * Top navigation bar for the dashboard.
 *
 * Contains:
 *   - Mobile hamburger (lg:hidden)
 *   - Search input
 *   - City indicator (Kolkata - static)
 *   - Notification bell (badge)
 *   - Messages icon (badge)
 *   - User avatar + name + verified badge
 */
export function Topbar() {
  const { isCollapsed } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-soft-border bg-white/95 px-4 backdrop-blur-sm transition-all duration-300 sm:px-6",
        isCollapsed ? "lg:pl-[calc(72px+1.5rem)]" : "lg:pl-[calc(260px+1.5rem)]"
      )}
    >
      {/* Mobile sidebar trigger */}
      <MobileSidebarTrigger />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search companions, experiences, or places..."
          className="h-9 w-full rounded-xl border-soft-border bg-muted/40 pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus-visible:border-berry focus-visible:ring-berry/20"
          aria-label="Search"
        />
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* City — Static Kolkata */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-soft-border px-3 py-1.5 text-sm text-foreground">
          <MapPin className="size-3.5 text-berry" />
          <span className="font-medium">Kolkata</span>
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          aria-label="Notifications (3 new)"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-berry text-[9px] font-bold text-white">
            3
          </span>
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          aria-label="Messages (2 unread)"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            2
          </span>
        </Link>

        {/* User profile */}
        <Link href="/dashboard" className="flex items-center gap-2.5 rounded-xl pl-1 pr-2 py-1 transition-colors hover:bg-muted">
          {/* Avatar placeholder */}
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-berry to-dusty-rose text-xs font-bold text-white">
            {mockUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="flex items-center gap-1 text-sm font-semibold leading-tight text-foreground">
              {mockUser.name}
              {mockUser.isVerified && (
                <BadgeCheck className="size-3.5 text-berry" />
              )}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Verified User
            </span>
          </div>
          <ChevronDown className="hidden sm:block size-3.5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
