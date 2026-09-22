"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Star,
  BadgeCheck,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Users,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  savedCompanions,
  recentlyViewed,
  type SavedCompanion,
} from "@/config/saved-data";

/* ─── Filter type ─── */
type FilterTab = "all" | "online" | "offline";

/* ─── Saved Companion Card ─── */

function SavedCompanionCard({
  companion,
  onRemove,
}: {
  companion: SavedCompanion;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-soft-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-berry-dark/70 via-berry/50 to-dusty-rose/30" />

        {/* Online/Offline badge */}
        <span
          className={cn(
            "absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm",
            companion.isOnline
              ? "bg-emerald-500/90 text-white"
              : "bg-gray-500/80 text-white"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              companion.isOnline ? "bg-white" : "bg-white/60"
            )}
          />
          {companion.isOnline ? "Online" : "Offline"}
        </span>

        {/* Favorite (filled) */}
        <button
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/80 text-berry shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          aria-label={`Unsave ${companion.name}`}
        >
          <Heart className="size-4" fill="currentColor" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-foreground">{companion.name}</h3>
          {companion.isVerified && (
            <BadgeCheck className="size-4 text-sky-500" />
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 text-berry" />
          {companion.age} years · {companion.city}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <Star className="size-3.5 text-amber-500" fill="currentColor" />
          <span className="text-sm font-semibold text-foreground">
            {companion.rating}
          </span>
          <span className="text-xs text-muted-foreground">
            ({companion.reviews} reviews)
          </span>
        </div>

        {/* Interest tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {companion.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-md border border-soft-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="mt-2.5 text-xs italic text-muted-foreground leading-relaxed line-clamp-2">
          &ldquo;{companion.bio}&rdquo;
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button className="h-9 flex-1 rounded-xl border border-berry bg-white hover:bg-berry/5 text-berry text-xs font-semibold">
            <Link
              href={`/companion/${companion.id}`}
              className="flex items-center gap-1"
            >
              View Profile
            </Link>
          </Button>
          <button
            onClick={() => onRemove(companion.id)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-soft-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            aria-label={`Remove ${companion.name} from saved`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Saved Companions page.
 *
 * Backend-ready architecture:
 *   - Saved companions from mock file (swap with GET /api/users/me/saved-companions)
 *   - Remove action ready for DELETE /api/users/me/saved-companions/:id
 *   - Recently viewed from mock (swap with GET /api/users/me/recently-viewed)
 *   - Filter tabs (all/online/offline) ready for query params
 */
export default function SavedCompanionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [companions, setCompanions] = useState(savedCompanions);

  const filtered = useMemo(() => {
    if (activeFilter === "online") return companions.filter((c) => c.isOnline);
    if (activeFilter === "offline") return companions.filter((c) => !c.isOnline);
    return companions;
  }, [activeFilter, companions]);

  const onlineCount = companions.filter((c) => c.isOnline).length;
  const offlineCount = companions.filter((c) => !c.isOnline).length;

  function handleRemove(id: string) {
    // TODO: Call DELETE /api/users/me/saved-companions/:id
    setCompanions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Heart className="size-7 text-berry" />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Saved Companions
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your favorite companions, all in one place. ♡
          </p>
        </div>

        {/* Info tip */}
        <div className="flex items-center gap-2 rounded-xl border border-soft-border bg-white px-4 py-2.5 shadow-sm">
          <Heart className="size-4 shrink-0 text-berry" />
          <p className="text-xs text-muted-foreground">
            Your saved list helps you quickly find and connect with your favorite people.
          </p>
        </div>
      </div>

      {/* ═══ FILTER TABS ═══ */}
      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            activeFilter === "all"
              ? "bg-deep-plum text-white shadow-sm"
              : "border border-soft-border bg-white text-muted-foreground hover:text-foreground"
          )}
        >
          All ({companions.length})
        </button>
        <button
          onClick={() => setActiveFilter("online")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            activeFilter === "online"
              ? "bg-deep-plum text-white shadow-sm"
              : "border border-soft-border bg-white text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Online ({onlineCount})
        </button>
        <button
          onClick={() => setActiveFilter("offline")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            activeFilter === "offline"
              ? "bg-deep-plum text-white shadow-sm"
              : "border border-soft-border bg-white text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="size-1.5 rounded-full bg-gray-400" />
          Offline ({offlineCount})
        </button>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="mt-6 flex flex-col gap-6 xl:flex-row">
        {/* ═══ LEFT — CARDS GRID ═══ */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((companion) => (
              <SavedCompanionCard
                key={companion.id}
                companion={companion}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="size-12 text-muted-foreground/30" />
              <p className="mt-3 text-lg font-semibold text-muted-foreground">
                No saved companions
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {activeFilter !== "all"
                  ? "No companions match this filter."
                  : "Start exploring and save companions you like!"}
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-flex h-9 items-center gap-1 rounded-xl bg-berry px-5 text-xs font-semibold text-white hover:bg-berry-dark"
              >
                Explore Companions <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {filtered.length} saved companions
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="flex size-8 items-center justify-center rounded-lg border border-soft-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button className="flex size-8 items-center justify-center rounded-lg bg-deep-plum text-xs font-semibold text-white">
                  1
                </button>
                <button
                  disabled
                  className="flex size-8 items-center justify-center rounded-lg border border-soft-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <aside className="w-full shrink-0 xl:w-[280px] space-y-5">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="size-4 text-berry" />
              Quick Actions
            </h3>
            <div className="mt-4 space-y-1">
              {[
                {
                  icon: Users,
                  label: "Explore Companions",
                  sub: "Find new people to connect with",
                  href: "/explore",
                },
                {
                  icon: CalendarDays,
                  label: "My Bookings",
                  sub: "View your upcoming & past bookings",
                  href: "/bookings",
                },
                {
                  icon: MessageCircle,
                  label: "Send Message",
                  sub: "Chat with your saved companions",
                  href: "/messages",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/8">
                    <action.icon className="size-4 text-berry" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {action.sub}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                Recently Viewed
              </h3>
              <Link
                href="#"
                className="flex items-center gap-0.5 text-[10px] font-semibold text-berry hover:text-berry-dark"
              >
                View All <ArrowRight className="size-2.5" />
              </Link>
            </div>
            <div className="mt-3 space-y-1">
              {recentlyViewed.map((person) => (
                <Link
                  key={person.id}
                  href={`/companion/${person.id}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted"
                >
                  {/* Avatar placeholder */}
                  <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-dusty-rose to-berry" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {person.name}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {person.age} years · {person.city}
                      <span className="size-1.5 rounded-full bg-emerald-500 ml-1" />
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          </div>

          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-plum via-berry-dark to-berry p-5">
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
            <div className="relative z-10">
              <p className="font-serif text-lg italic text-white/60 leading-snug">
                Good People
                <br />
                Make Great
                <br />
                Connections ♡
              </p>
            </div>
            {/* Silhouette placeholder */}
            <div className="absolute bottom-0 right-0 h-20 w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-plum/80 to-transparent" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
