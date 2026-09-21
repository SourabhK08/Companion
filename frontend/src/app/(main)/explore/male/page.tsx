"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Lock,
  Heart,
  CalendarDays,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CompanionCard } from "@/components/companions/companion-card";
import {
  maleCompanions,
  companionCategories,
  interestFilters,
} from "@/config/companions-data";

/* ─── Value Props Icons ─── */

const valuePropIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "shield-check": ShieldCheck,
  lock: Lock,
  calendar: CalendarDays,
  users: Users,
};

const valueProps = [
  { icon: "shield-check", title: "100% Verified", description: "ID & profile verification" },
  { icon: "lock", title: "Discreet & Private", description: "Your data stays safe" },
  { icon: "calendar", title: "Flexible Bookings", description: "Choose what suits you" },
  { icon: "users", title: "Real People", description: "Meaningful experiences" },
];

/**
 * Explore Male Dating Companions page.
 *
 * Backend-ready architecture:
 *   - Filter/search state managed in component (ready for URL params sync)
 *   - Companion data from mock file (swap with API call)
 *   - Pagination ready (swap `currentPage` with router query)
 *   - CompanionCard is reusable across all explore pages
 */
export default function ExploreMalePage() {
  const [activeCategory, setActiveCategory] = useState("All Men");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Dating"]);

  // Filter companions (client-side for now — replace with API params)
  const filteredCompanions = maleCompanions.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.profession.toLowerCase().includes(q) ||
        c.interests.some((i) => i.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCompanions = 48; // Mock total from API
  const perPage = 8;
  const totalPages = Math.ceil(totalCompanions / perPage);

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
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
              "radial-gradient(circle at 35% 40%, rgba(245,182,201,0.15), transparent 50%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.08), transparent 40%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 40%, var(--color-berry) 70%, var(--color-dusty-rose) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-deep-plum/95 via-deep-plum/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-10 lg:px-8 lg:py-14">
          <div className="max-w-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-dusty-rose/80 sm:text-xs">
              Male Dating Companions
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Meet Genuine Men,
              <br />
              <span className="italic text-dusty-rose">Real Connections</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
              Discover verified, respectful and well-mannered male companions
              for your dates, hangouts, events or meaningful conversations.
              Find a genuine companion who matches your vibe and makes your
              experience special.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, label: "Verified Profiles", sub: "(100% Genuine)" },
                { icon: Lock, label: "Safe & Discreet", sub: "Your Privacy Matters" },
                { icon: Heart, label: "Respectful", sub: "& Well-Mannered" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-white/10">
                    <badge.icon className="size-3.5 text-dusty-rose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-white/80">{badge.label}</p>
                    <p className="text-[9px] text-white/50">{badge.sub}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-dusty-rose">
                  18+
                </div>
                <div>
                  <p className="text-[10px] font-medium text-white/80">18+ Only</p>
                  <p className="text-[9px] text-white/50">(Verified Age)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side decorative + CTA */}
          <div className="hidden lg:flex flex-col items-end gap-6">
            <p className="font-serif text-2xl italic text-white/15 leading-tight text-right xl:text-3xl">
              Good Conversations
              <br />
              Better Dates
            </p>
            <Link
              href="#companions"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-deep-plum shadow-lg transition-colors hover:bg-dusty-rose hover:text-deep-plum"
            >
              Find Your Male Companion
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ROW ═══ */}
      <section className="border-b border-soft-border bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-4 lg:px-8">
          {valueProps.map((prop) => {
            const Icon = valuePropIcons[prop.icon];
            return (
              <div key={prop.title} className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/8">
                  {Icon && <Icon className="size-5 text-berry" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                  <p className="text-[11px] text-muted-foreground">{prop.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section id="companions" className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
        {/* Header + Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Male Companions
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Find Your Male Dating Companion
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse through our verified male companions and choose the one
              that matches your vibe, occasion and preferences.
            </p>
          </div>
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by name, interests, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl border-soft-border bg-white pl-10 text-sm placeholder:text-muted-foreground/50 focus-visible:border-berry focus-visible:ring-berry/20"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {companionCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                activeCategory === cat
                  ? "bg-deep-plum text-white shadow-sm"
                  : "border border-soft-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid + Sidebar Filter */}
        <div className="mt-6 flex flex-col gap-6 xl:flex-row">
          {/* Companion Cards Grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanions.map((companion) => (
                <CompanionCard key={companion.id} companion={companion} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing 1-{filteredCompanions.length} of {totalCompanions} companions
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex size-8 items-center justify-center rounded-lg border border-soft-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                        currentPage === page
                          ? "bg-deep-plum text-white"
                          : "border border-soft-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex size-8 items-center justify-center rounded-lg border border-soft-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ FILTER SIDEBAR ═══ */}
          <aside className="w-full shrink-0 xl:w-[260px]">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Filter Companions</h3>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-berry hover:text-berry-dark"
                  onClick={() => setSelectedInterests(["Dating"])}
                >
                  Reset <RotateCcw className="size-3" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Price Range</label>
                <div className="mt-2">
                  <input
                    type="range"
                    min={1000}
                    max={5000}
                    defaultValue={5000}
                    step={100}
                    className="w-full accent-berry"
                    aria-label="Price range"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>₹1,000</span>
                    <span>₹5,000</span>
                  </div>
                </div>
              </div>

              {/* Age Range */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Age Range</label>
                <select
                  className="mt-2 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
                  defaultValue=""
                >
                  <option value="" disabled>Select Age Range</option>
                  <option value="18-25">18 – 25</option>
                  <option value="25-30">25 – 30</option>
                  <option value="30-35">30 – 35</option>
                  <option value="35+">35+</option>
                </select>
              </div>

              {/* Interests */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Interests</label>
                <div className="mt-2 space-y-2">
                  {interestFilters.map((interest) => (
                    <div key={interest} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={selectedInterests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                        className="border-soft-border data-checked:bg-berry data-checked:border-berry"
                      />
                      <Label
                        htmlFor={`interest-${interest}`}
                        className="text-sm text-muted-foreground font-normal cursor-pointer"
                      >
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Location</label>
                <select
                  className="mt-2 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
                  defaultValue=""
                >
                  <option value="" disabled>Select City</option>
                  <option value="kolkata">Kolkata</option>
                </select>
              </div>

              {/* Availability */}
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Availability</label>
                <select
                  className="mt-2 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
                  defaultValue="any"
                >
                  <option value="any">Any Time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="weekend">Weekends</option>
                </select>
              </div>

              {/* Apply */}
              <Button className="mt-6 h-10 w-full rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-semibold">
                Apply Filters
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-8 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-deep-plum">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 50%, rgba(122,31,57,0.6), transparent 60%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 50%, var(--color-berry) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 px-8 py-10 sm:flex-row sm:px-12">
            <div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                More Than Just a Date.
                <br />
                <span className="font-normal">Real Conversations.</span>
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Book your favorite male companion in just a few clicks and make
                your next experience unforgettable.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/explore"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Book a Companion <ArrowRight className="size-4" />
              </Link>
              <p className="hidden md:block font-serif text-base italic text-white/25 leading-tight">
                Real People.
                <br />
                Real Stories.
                <br />
                Real Connections ♡
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
