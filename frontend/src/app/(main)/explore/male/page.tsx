"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CompanionCard } from "@/components/companions/companion-card";
import { PriceRangeFilter } from "@/components/shared/price-range-filter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCompanions } from "@/hooks/use-companions";
import {
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
function MaleFilterControls({
  maxPrice,
  setMaxPrice,
  priceMin,
  priceMax,
  selectedAge,
  setSelectedAge,
  selectedInterests,
  toggleInterest,
  selectedLocation,
  setSelectedLocation,
  selectedAvailability,
  setSelectedAvailability,
  setCurrentPage,
}: {
  maxPrice: number | null;
  setMaxPrice: (val: number | null) => void;
  priceMin: number;
  priceMax: number;
  selectedAge: string;
  setSelectedAge: (val: string) => void;
  selectedInterests: string[];
  toggleInterest: (interest: string) => void;
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedAvailability: string;
  setSelectedAvailability: (val: string) => void;
  setCurrentPage: (val: number | ((prev: number) => number)) => void;
}) {
  return (
    <div className="space-y-5">
      <PriceRangeFilter
        min={priceMin}
        max={priceMax}
        value={maxPrice}
        onChange={(val) => {
          setMaxPrice(val);
          setCurrentPage(1);
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Age Range</label>
        <select
          className="mt-1 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
          value={selectedAge}
          onChange={(e) => {
            setSelectedAge(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Any Age</option>
          <option value="18-25">18 – 25</option>
          <option value="25-30">25 – 30</option>
          <option value="30-35">30 – 35</option>
          <option value="35+">35+</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Interests</label>
        <div className="mt-1 space-y-2">
          {interestFilters.map((interest) => (
            <div key={interest} className="flex items-center gap-2.5">
              <Checkbox
                id={`male-interest-${interest}`}
                checked={selectedInterests.includes(interest)}
                onCheckedChange={() => toggleInterest(interest)}
                className="border-soft-border data-checked:bg-berry data-checked:border-berry"
              />
              <Label
                htmlFor={`male-interest-${interest}`}
                className="text-sm text-muted-foreground font-normal cursor-pointer"
              >
                {interest}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Location</label>
        <select
          className="mt-1 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Locations</option>
          <option value="kolkata">Kolkata</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="bangalore">Bangalore</option>
          <option value="jaipur">Jaipur</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Availability</label>
        <select
          className="mt-1 h-9 w-full rounded-lg border border-soft-border bg-white px-3 text-sm text-muted-foreground focus:border-berry focus:outline-none focus:ring-1 focus:ring-berry/20"
          value={selectedAvailability}
          onChange={(e) => {
            setSelectedAvailability(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="any">Any Time</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="weekend">Weekends</option>
        </select>
      </div>
    </div>
  );
}

export default function ExploreMalePage() {
  const [activeCategory, setActiveCategory] = useState("All Men");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("any");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const priceMin = 300;
  const priceMax = 10000;
  const perPage = 9;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Combine category tab + selected interests
  const interestsList = [...selectedInterests];
  if (activeCategory !== "All Men" && activeCategory !== "More" && !interestsList.includes(activeCategory)) {
    interestsList.push(activeCategory);
  }

  // Fetch companions from real API
  const { companions, pagination, isLoading, error } = useCompanions({
    gender: "male",
    city: selectedLocation && selectedLocation !== "all" ? selectedLocation : undefined,
    search: debouncedSearch || undefined,
    page: currentPage,
    limit: perPage,
    maxPrice: maxPrice && maxPrice < priceMax ? maxPrice : undefined,
    age: selectedAge || undefined,
    interests: interestsList.length > 0 ? interestsList.join(",") : undefined,
  });

  const totalCompanions = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  function toggleInterest(interest: string) {
    setCurrentPage(1);
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "All Men") count++;
    if (searchQuery.trim()) count++;
    if (maxPrice !== null && maxPrice < priceMax) count++;
    if (selectedAge) count++;
    if (selectedLocation !== "all") count++;
    if (selectedAvailability !== "any") count++;
    if (selectedInterests.length > 0) {
      count += selectedInterests.length;
    }
    return count;
  }, [activeCategory, searchQuery, maxPrice, selectedAge, selectedLocation, selectedAvailability, selectedInterests, priceMax]);

  const handleReset = () => {
    setActiveCategory("All Men");
    setSearchQuery("");
    setDebouncedSearch("");
    setMaxPrice(null);
    setSelectedAge("");
    setSelectedLocation("all");
    setSelectedAvailability("any");
    setSelectedInterests([]);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    document.getElementById("companions")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full min-w-0 overflow-x-hidden">
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

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14 w-full min-w-0">
          <div className="max-w-lg min-w-0">
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
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                    <badge.icon className="size-4 text-dusty-rose" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90">{badge.label}</p>
                    <p className="text-[11px] text-white/60">{badge.sub}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-dusty-rose">
                  18+
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90">18+ Only</p>
                  <p className="text-[11px] text-white/60">(Verified Age)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side decorative + CTA */}
          <div className="hidden lg:flex flex-col items-end gap-6 shrink-0">
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
      <section className="border-b border-soft-border bg-white w-full min-w-0 max-w-full overflow-hidden">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 sm:gap-4 px-4 py-4 sm:py-5 sm:grid-cols-4 sm:px-6 lg:px-8 w-full min-w-0">
          {valueProps.map((prop) => {
            const Icon = valuePropIcons[prop.icon];
            return (
              <div key={prop.title} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-berry/8">
                  {Icon && <Icon className="size-4.5 sm:size-5 text-berry" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{prop.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{prop.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section id="companions" className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
        {/* Header + Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Male Companions
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Find Your Male Dating Companion
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Browse through our verified male companions and choose the one
              that matches your vibe, occasion and preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search companions..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 rounded-xl border-soft-border bg-white pl-10 text-xs sm:text-sm placeholder:text-muted-foreground/50 focus-visible:border-berry focus-visible:ring-berry/20"
              />
            </div>

            {/* Mobile / Tablet Filter Trigger Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger
                className="flex h-10 items-center gap-1.5 rounded-xl border border-soft-border bg-white px-3.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted active:scale-95 xl:hidden cursor-pointer shrink-0"
              >
                <SlidersHorizontal className="size-3.5 text-berry" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-berry text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent
                side="right"
                className="!fixed !top-0 !bottom-0 !right-0 !inset-y-0 !h-[100dvh] !max-h-[100dvh] !w-full sm:!max-w-md p-0 bg-white border-l border-soft-border overflow-hidden gap-0 z-50 shadow-2xl"
                showCloseButton={false}
              >
                {/* Header - Fixed top */}
                <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between border-b border-soft-border px-5 bg-white z-20">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base sm:text-lg font-bold text-foreground">
                      Filter Companions
                    </SheetTitle>
                    {activeFilterCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-berry text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                    <SheetClose className="flex size-8 items-center justify-center rounded-full bg-black/5 text-muted-foreground hover:bg-black/10 transition-colors cursor-pointer">
                      <X className="size-4" />
                      <span className="sr-only">Close filters</span>
                    </SheetClose>
                  </div>
                </div>

                {/* Scrollable Body - Locked between Header and Footer */}
                <div className="absolute top-16 bottom-[76px] inset-x-0 overflow-y-auto overscroll-contain p-4 sm:p-5 pb-8 space-y-5 [-webkit-overflow-scrolling:touch]">
                  <MaleFilterControls
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    selectedAge={selectedAge}
                    setSelectedAge={setSelectedAge}
                    selectedInterests={selectedInterests}
                    toggleInterest={toggleInterest}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedAvailability={selectedAvailability}
                    setSelectedAvailability={setSelectedAvailability}
                    setCurrentPage={setCurrentPage}
                  />
                </div>

                {/* Fixed Footer - Always pinned at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-[76px] pb-[env(safe-area-inset-bottom,0px)] border-t border-soft-border bg-white px-4 flex items-center shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-20">
                  <Button
                    onClick={handleApplyFilters}
                    className="w-full h-11 rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-semibold shadow-md cursor-pointer active:scale-[0.99]"
                  >
                    Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-5 w-full min-w-0 max-w-full overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2 w-max">
            {companionCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
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
        </div>

        {/* Grid + Sidebar Filter */}
        <div className="mt-6 flex flex-col gap-6 xl:flex-row w-full min-w-0">
          {/* Companion Cards Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
                {Array.from({ length: perPage }).map((_, i) => (
                  <div key={i} className="h-[360px] animate-pulse rounded-[22px] border border-soft-border bg-muted/30" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <p className="mt-1 text-xs text-muted-foreground">Please try again later.</p>
              </div>
            ) : companions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-foreground">No companions found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full min-w-0">
                {companions.map((companion) => (
                  <CompanionCard key={companion.id} companion={companion} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 w-full min-w-0">
              <p className="text-xs text-muted-foreground">
                Showing {companions.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0}-{Math.min(currentPage * perPage, totalCompanions)} of {totalCompanions} companions
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
          <aside className="hidden xl:block w-full shrink-0 xl:w-[260px] h-fit sticky top-24">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Filter Companions</h3>
                  {activeFilterCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-berry text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-berry hover:text-berry-dark cursor-pointer transition-colors"
                  onClick={handleReset}
                >
                  Reset <RotateCcw className="size-3" />
                </button>
              </div>

              <div className="mt-5">
                <MaleFilterControls
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  selectedAge={selectedAge}
                  setSelectedAge={setSelectedAge}
                  selectedInterests={selectedInterests}
                  toggleInterest={toggleInterest}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  selectedAvailability={selectedAvailability}
                  setSelectedAvailability={setSelectedAvailability}
                  setCurrentPage={setCurrentPage}
                />
              </div>

              <Button
                onClick={handleApplyFilters}
                className="mt-6 h-10 w-full rounded-xl bg-deep-plum hover:bg-berry-dark text-white text-sm font-semibold cursor-pointer"
              >
                Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="mx-auto w-full min-w-0 max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-deep-plum w-full min-w-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 50%, rgba(122,31,57,0.6), transparent 60%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 50%, var(--color-berry) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-start sm:items-center justify-between gap-6 px-5 py-8 sm:flex-row sm:px-12 w-full min-w-0">
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
