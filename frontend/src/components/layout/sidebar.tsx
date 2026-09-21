"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  MessageCircle,
  Heart,
  HeartHandshake,
  Star,
  Wallet,
  ShieldCheck,
  User,
  Users,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  FileText,
  Handshake,
  Info,
  LayoutGrid,
} from "lucide-react";
import { cn } from "cn";

import { Logo } from "@/components/shared/logo";
import { sidebarExploreLinks, sidebarUserLinks } from "@/config/site";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

/* ─── Custom Gender Icons (not in Lucide) ─── */

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="5" />
      <path d="M19 5l-5.4 5.4" />
      <path d="M15 5h4v4" />
    </svg>
  );
}

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7" />
      <path d="M9 18h6" />
    </svg>
  );
}

function CalendarSearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="18" cy="18" r="3" />
      <path d="M22 22l-1.5-1.5" />
    </svg>
  );
}

function UsersCogIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 15l-3 3-1.5-1.5" />
      <path d="M19 12v6" />
    </svg>
  );
}

/* ─── Icon Map ─── */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "calendar-search": CalendarSearchIcon,
  "layout-dashboard": LayoutGrid,
  "users-round": Users,
  male: MaleIcon,
  female: FemaleIcon,
  "heart-handshake": HeartHandshake,
  "users-cog": UsersCogIcon,
  "calendar-check": CalendarCheck,
  "message-circle": MessageCircle,
  heart: Heart,
  star: Star,
  wallet: Wallet,
  shield: ShieldCheck,
  user: User,
  settings: Settings,
  "file-text": FileText,
  handshake: Handshake,
  info: Info,
};

/* ─── Sidebar Context ─── */

interface SidebarContextValue {
  isCollapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggle: () => setIsCollapsed((p) => !p) }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/* ─── Sidebar Navigation Item ─── */

function SidebarNavItem({
  href,
  icon,
  label,
  badge,
  isCollapsed,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-berry text-white shadow-md shadow-berry/25"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "size-5 shrink-0 transition-colors",
            isActive ? "text-white" : "text-white/60 group-hover:text-white"
          )}
        />
      )}
      {!isCollapsed && (
        <span className="leading-snug">{label}</span>
      )}
      {badge && badge > 0 && (
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white",
            isCollapsed ? "absolute -right-1 -top-1" : "ml-auto shrink-0"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/* ─── Nav Content (shared between desktop + mobile) ─── */

function SidebarNavContent({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <nav
      className="flex-1 overflow-y-auto px-3 py-2 space-y-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
      aria-label="Dashboard navigation"
    >
      {/* Group 1: Explore */}
      {sidebarExploreLinks.map((link) => (
        <SidebarNavItem
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          isCollapsed={isCollapsed}
        />
      ))}

      {/* Divider */}
      <div className="!my-3 mx-1 border-t border-white/10" aria-hidden="true" />

      {/* Group 2: User actions */}
      {sidebarUserLinks.map((link) => (
        <SidebarNavItem
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          badge={"badge" in link ? link.badge : undefined}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
}

/* ─── Desktop Sidebar ─── */

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-white/5 bg-deep-plum transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center shrink-0 border-b border-white/8 px-4",
          isCollapsed ? "h-16 justify-center" : "h-16"
        )}
      >
        {isCollapsed ? (
          <div className="flex size-9 items-center justify-center rounded-full bg-berry/30">
            <Heart className="size-4 text-dusty-rose" fill="currentColor" />
          </div>
        ) : (
          <Logo variant="light" size="sm" />
        )}
      </div>

      {/* Scrollable nav */}
      <SidebarNavContent isCollapsed={isCollapsed} />

      {/* Bottom section */}
      <div className="mt-auto flex flex-col shrink-0 border-t border-white/8">
        {/* Decorative tagline + image placeholder */}
        {!isCollapsed && (
          <div className="relative overflow-hidden px-4 pt-4 pb-2">
            {/* Tagline */}
            <p className="relative z-10 font-serif text-sm italic leading-snug text-[#f0d3df]/60">
              Good People
              <br />
              Better Conversations ♡
            </p>

            {/* ── Image Placeholder ──
             *  Replace the gradient below with a real image:
             *  <Image src="/assets/sidebar-kolkata.webp" ... />
             */}
            <div className="relative mt-2 h-24 w-full overflow-hidden rounded-lg">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgba(42,9,39,0.95) 0%, rgba(42,9,39,0.3) 40%, transparent 100%), linear-gradient(135deg, rgba(139,20,85,0.3), rgba(201,143,169,0.15))",
                }}
              />
              {/* Silhouette placeholder — Howrah Bridge / Victoria Memorial */}
              <div className="absolute bottom-0 inset-x-0 h-16">
                <svg
                  viewBox="0 0 260 60"
                  fill="none"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMax slice"
                  aria-hidden="true"
                >
                  {/* Victoria Memorial silhouette */}
                  <path
                    d="M20 60V45h5v-10h3v-5h4v-3h2v-4h3v-5l5-3 5 3v5h3v4h2v3h4v5h3v10h5v15z"
                    fill="rgba(255,255,255,0.08)"
                  />
                  {/* Howrah Bridge silhouette */}
                  <path
                    d="M140 60V50c0-5 5-18 20-25 15-7 30-8 40-8h5v-2c-2-3-10-5-20-5s-20 2-25 5c-5 3-10 8-12 12-2-4-7-9-12-12-5-3-15-5-25-5s-18 2-20 5v2h5c10 0 25 1 40 8 15 7 20 20 20 25v10z"
                    fill="rgba(255,255,255,0.06)"
                  />
                  {/* Ground line */}
                  <rect x="0" y="55" width="260" height="5" fill="rgba(255,255,255,0.04)" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-6 py-3 text-sm text-white/50 transition-colors hover:text-white/80"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-5 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="size-5" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Log Out */}
        <button
          className="flex items-center gap-3 border-t border-white/8 px-6 py-4 text-sm text-white/60 transition-colors hover:text-white"
          aria-label="Log out"
        >
          <LogOut className="size-5 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile Sidebar Trigger (used in Topbar) ─── */

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-deep-plum p-0 border-r-white/10">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center px-4 py-4 border-b border-white/8">
            <Logo variant="light" size="sm" />
          </div>

          {/* Nav (scrollable) */}
          <SidebarNavContent isCollapsed={false} />

          {/* Bottom tagline */}
          <div className="relative overflow-hidden px-4 pt-4 pb-2 border-t border-white/8">
            <p className="relative z-10 font-serif text-sm italic leading-snug text-[#f0d3df]/60">
              Good People Better Conversations ♡
            </p>
            <div className="relative mt-2 h-16 w-full overflow-hidden rounded-lg bg-gradient-to-t from-deep-plum/80 to-berry/10" />
          </div>

          {/* Log Out */}
          <div className="border-t border-white/8">
            <button className="flex w-full items-center gap-3 px-6 py-4 text-sm text-white/60 transition-colors hover:text-white">
              <LogOut className="size-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
