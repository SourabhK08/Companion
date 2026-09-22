"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Heart,
  Users,
  Sparkles,
  CalendarDays,
  Utensils,
  Palette,
  Dumbbell,
  Gamepad2,
  Wrench,
  MoreHorizontal,
  Compass,
  Leaf,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EventCard } from "@/components/events/event-card";
import {
  upcomingEvents,
  eventCategories,
  eventTypeFilters,
} from "@/config/events-data";

/* ─── Category Icon Map ─── */

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "All Events": CalendarDays,
  Social: Users,
  Travel: Compass,
  Wellness: Leaf,
  "Food & Drink": Utensils,
  "Arts & Culture": Palette,
  Sports: Dumbbell,
  Gaming: Gamepad2,
  Workshops: Wrench,
  Other: MoreHorizontal,
};

/**
 * Explore Upcoming Offline Events page.
 *
 * Backend-ready architecture:
 *   - Filter/search state managed in component (ready for URL params sync)
 *   - Event data from mock file (swap with API call: GET /api/events)
 *   - EventCard is reusable across event listing contexts
 *   - Category, location, date, price filters ready for query params
 */
export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Social"]);

  // Filter events (client-side for now — replace with API params)
  const filteredEvents = upcomingEvents.filter((evt) => {
    if (activeCategory !== "All Events" && evt.category !== activeCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  return (
    <div className="flex flex-col">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-deep-plum">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(245,182,201,0.12), transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 40%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 40%, var(--color-berry) 75%, var(--color-dusty-rose) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-deep-plum/95 via-deep-plum/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-10 lg:px-8 lg:py-14">
          <div className="max-w-lg">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-dusty-rose/80 sm:text-xs">
                Upcoming Events
              </span>
              <span className="h-px w-10 bg-dusty-rose/40" aria-hidden="true" />
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Real People.
              <br />
              <span className="italic text-dusty-rose">Unforgettable Moments.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              Discover amazing events, meet like-minded people, and be part of a
              community that celebrates connection, comfort and authenticity.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-5">
              {[
                { icon: Users, label: "Meet People" },
                { icon: ShieldCheck, label: "Safe & Inclusive" },
                { icon: Sparkles, label: "Verified Hosts" },
                { icon: Heart, label: "Memorable Experiences" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                    <badge.icon className="size-4 text-dusty-rose" />
                  </div>
                  <span className="text-[11px] font-medium text-white/75">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right decorative */}
          <div className="hidden lg:flex flex-col items-end gap-4 text-right">
            <p className="font-serif text-xl italic text-white/12 leading-tight xl:text-2xl">
              Good People
              <br />
              Better Conversations
              <br />
              Kolkata ♡
            </p>
            <p className="font-serif text-sm italic text-dusty-rose/30 leading-tight">
              Kolkata Feels
              <br />
              Better Together ♡
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY ICON TABS ═══ */}
      <section className="border-b border-soft-border bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {eventCategories.map((cat) => {
              const Icon = categoryIconMap[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-3 text-[11px] font-semibold transition-all",
                    isActive
                      ? "bg-deep-plum text-white shadow-md"
                      : "border border-soft-border bg-white text-muted-foreground hover:border-berry/30 hover:text-berry"
                  )}
                >
                  {Icon && <Icon className={cn("size-5", isActive ? "text-white" : "text-berry/60")} />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SEARCH + FILTER BAR ═══ */}
      <section className="border-b border-soft-border bg-warm-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-4 lg:px-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search events by name, location, or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl border-soft-border bg-white pl-10 text-sm placeholder:text-muted-foreground/50 focus-visible:border-berry focus-visible:ring-berry/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="h-10 rounded-xl border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20">
              <option>Kolkata</option>
            </select>
            <select className="h-10 rounded-xl border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20">
              <option>Any Date</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Next Month</option>
            </select>
            <select className="h-10 rounded-xl border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20">
              <option>Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Upcoming Events
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Don&apos;t Miss These Amazing Events
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              From cozy coffee meetups to exciting travel trips, find the
              perfect event for you.
            </p>
          </div>
        </div>

        {/* Grid + Sidebar Filter */}
        <div className="mt-6 flex flex-col gap-6 xl:flex-row">
          {/* Event Cards Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="size-12 text-muted-foreground/30" />
                <p className="mt-3 text-lg font-semibold text-muted-foreground">
                  No events found
                </p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>

          {/* ═══ FILTER SIDEBAR ═══ */}
          <aside className="w-full shrink-0 xl:w-[260px] space-y-5">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-foreground">Filter Events</h3>

              {/* Event Type */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Event Type</label>
                <div className="mt-2 space-y-2">
                  {eventTypeFilters.map((type) => (
                    <div key={type} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                        className="border-soft-border data-checked:bg-berry data-checked:border-berry"
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-sm text-muted-foreground font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Location</label>
                <select className="mt-2 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20">
                  <option value="">Select City</option>
                  <option value="kolkata">Kolkata</option>
                </select>
              </div>

              {/* Date */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Date</label>
                <select className="mt-2 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20">
                  <option>Any Date</option>
                  <option>Today</option>
                  <option>This Weekend</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Price Range</label>
                <div className="mt-2">
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    defaultValue={5000}
                    step={100}
                    className="w-full accent-berry"
                    aria-label="Price range"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>₹0</span>
                    <span>₹5,000+</span>
                  </div>
                </div>
              </div>

              {/* Apply */}
              <Button className="mt-5 h-10 w-full rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-semibold">
                Apply Filters
              </Button>
            </div>

            {/* Host CTA Card */}
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-full bg-berry/10">
                <Sparkles className="size-5 text-berry" />
              </div>
              <h4 className="mt-3 text-base font-bold text-foreground">
                Have an idea for a event?
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Connect with us with your idea and host the event with us.
              </p>
              <Link
                href="/host-event"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark"
              >
                Get Started <ArrowRight className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══ COMMUNITY BANNER ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-deep-plum">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(122,31,57,0.5), transparent 60%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 50%, var(--color-berry) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center justify-between gap-5 px-6 py-8 sm:flex-row sm:px-10">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Users className="size-6 text-dusty-rose" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  Join Community for This Page for Free
                </h3>
                <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
                  Get event updates, meet new people and be the first to know
                  about exciting events.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="#"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                {/* Instagram icon inline */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                Join on Instagram
              </Link>
              <Link
                href="#"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-500 px-5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                {/* WhatsApp icon inline */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Join on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROMO CARDS ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-8 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-deep-plum via-berry-dark to-berry p-6 sm:p-8">
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
            <div className="relative z-10 max-w-[240px]">
              <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                Make Kolkata
                <br />
                more special.
              </h3>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Explore our app for more interesting verified experiences.
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-flex size-9 items-center justify-center rounded-full bg-berry text-white shadow-sm transition-colors hover:bg-berry-dark"
                aria-label="Explore more"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-berry via-dusty-rose/80 to-dusty-rose p-6 sm:p-8">
            <div className="absolute inset-0 bg-black/5" aria-hidden="true" />
            <div className="relative z-10 max-w-[280px]">
              <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">
                This Puja.
                <br />
                Don&apos;t go alone.
              </h3>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                Find a verified companion for pandal hopping, food walks,
                meetups and city experiences.
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-flex size-9 items-center justify-center rounded-full bg-deep-plum text-white shadow-sm transition-colors hover:bg-berry-dark"
                aria-label="Find companions"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
