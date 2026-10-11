"use client";

import { useMemo, useState } from "react";
import {
  Heart,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  RotateCcw,
  X,
} from "lucide-react";

import Link from "next/link";
import { PriceRangeFilter } from "@/components/shared/price-range-filter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const chips = [
  "All",
  "Coffee",
  "Travel",
  "Food & Dining",
  "Music",
  "Sports",
  "Art & Culture",
  "More",
] as const;

const sortOptions = ["Recommended", "Newest", "Top Rated", "Nearby"] as const;
const genders = ["Female", "Male", "Non-binary", "Any"] as const;
const locationOptions = ["Kolkata", "Mumbai", "Delhi", "Bangalore"] as const;
const languageOptions = ["English", "Hindi", "Bengali", "Tamil"] as const;
const interestOptions = [
  "Coffee & Cafés",
  "Travel & Exploration",
  "Food & Dining",
  "Photography",
  "Sports",
  "Music",
  "Art & Culture",
  "Gaming",
  "More",
] as const;

import { useCompanions } from "@/hooks/use-companions";
import type { Companion } from "@/config/companions-data";


import { useSavedCompanions } from "@/hooks/use-saved-companions";

function BuddyCard({ buddy }: { buddy: Companion }) {
  const { isSaved, toggleSaved } = useSavedCompanions();
  const saved = isSaved(buddy.id);

  return (
    <div className="w-full max-w-[420px] mx-auto sm:max-w-none overflow-hidden rounded-[22px] border border-[#f0dfe3] bg-white shadow-[0_8px_22px_rgba(122,31,57,0.08)]">
      <div className="relative h-60 sm:h-52 w-full overflow-hidden bg-gradient-to-br from-[#7a1f39]/80 via-[#7a1f39]/60 to-[#d9a3ad]/40">
        {buddy.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buddy.avatar}
            alt={buddy.name}
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-bold text-white/60">
            {buddy.name
              .split(" ")
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-3">
          {buddy.isVerified && (
            <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#7a1f39] backdrop-blur-sm shadow-xs">
              <ShieldCheck className="size-4" />
              Verified
            </div>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleSaved(buddy.id);
            }}
            className="flex size-9 z-10 items-center justify-center rounded-full bg-white/85 text-[#7a1f39] backdrop-blur-sm ml-auto cursor-pointer" 
            type="button" 
            aria-label={`Save ${buddy.name}`}
          >
            <Heart className="size-4.5" fill={saved ? "currentColor" : "none"} color={saved ? "#7a1f39" : "currentColor"} />
          </button>
        </div>
      </div>

      <div className="space-y-3.5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#2d111b]">{buddy.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-[#6a4953]">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="size-3.5 fill-[#ffb84d] text-[#ffb84d]" />
                {buddy.rating}
              </span>
              <span>({buddy.reviews})</span>
            </div>
          </div>
          <span className="rounded-full border border-[#e7d5d8] bg-[#fff6f6] px-2.5 py-1 text-xs font-semibold text-[#7a1f39]">
            {buddy.city}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6d4a51]">
          <MapPin className="size-3.5 text-[#7a1f39] shrink-0" />
          <span>{buddy.city}</span>
          <span>•</span>
          <span>{buddy.languages.join(", ")}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {buddy.interests.map((item) => (
            <span key={item} className="rounded-full bg-[#f5e8eb] px-2.5 py-1 text-xs font-medium text-[#5a2435]">
              {item}
            </span>
          ))}
        </div>

        <Link
          href={`/companion/${buddy.id}`}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7a1f39] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#661b2f] cursor-pointer active:scale-[0.99]"
        >
          View Profile
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

function BuddyFilterControls({
  maxPrice,
  setMaxPrice,
  priceMin,
  priceMax,
  selectedAge,
  setSelectedAge,
  selectedGender,
  setSelectedGender,
  selectedLocation,
  setSelectedLocation,
  selectedLanguages,
  toggleLanguage,
  selectedInterests,
  toggleInterest,
  setCurrentPage,
}: {
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  priceMin: number;
  priceMax: number;
  selectedAge: string;
  setSelectedAge: (val: string) => void;
  selectedGender: (typeof genders)[number];
  setSelectedGender: (val: (typeof genders)[number]) => void;
  selectedLocation: (typeof locationOptions)[number];
  setSelectedLocation: (val: (typeof locationOptions)[number]) => void;
  selectedLanguages: string[];
  toggleLanguage: (lang: string) => void;
  selectedInterests: string[];
  toggleInterest: (interest: string) => void;
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
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Age Range
        </div>
        <div className="rounded-xl border border-[#e5dbe0] bg-white p-3">
          <select
            value={selectedAge}
            onChange={(e) => {
              setSelectedAge(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm text-[#5a1d2d] outline-none"
          >
            <option value="">Any Age</option>
            <option value="18-25">18 – 25</option>
            <option value="26-30">26 – 30</option>
            <option value="31-35">31 – 35</option>
            <option value="35+">35+</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Gender
        </div>
        <div className="rounded-xl border border-[#e5dbe0] bg-white p-3">
          <div className="space-y-2">
            {genders.map((gender) => (
              <label key={gender} className="flex cursor-pointer items-center gap-2 text-sm text-[#5a1d2d]">
                <input
                  type="radio"
                  name="gender"
                  checked={selectedGender === gender}
                  onChange={() => {
                    setSelectedGender(gender);
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 accent-[#7a1f39]"
                />
                <span>{gender}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Location
        </div>
        <div className="rounded-xl border border-[#e5dbe0] bg-white p-3">
          <select
            value={selectedLocation}
            onChange={(event) => {
              setSelectedLocation(event.target.value as (typeof locationOptions)[number]);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-sm text-[#5a1d2d] outline-none"
          >
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Languages
        </div>
        <div className="rounded-xl border border-[#e5dbe0] bg-white p-3">
          <div className="space-y-2 text-sm text-[#5a1d2d]">
            {languageOptions.map((language) => (
              <label key={language} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                  className="h-4 w-4 accent-[#7a1f39]"
                />
                <span>{language}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d4c56]">
          Interests
        </div>
        <div className="rounded-xl border border-[#e5dbe0] bg-white p-3">
          <div className="space-y-2 text-sm text-[#5a1d2d]">
            {interestOptions.map((interest) => (
              <label key={interest} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="h-4 w-4 accent-[#7a1f39]"
                />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExploreBuddiesPage() {
  const [selectedChip, setSelectedChip] = useState<(typeof chips)[number]>("All");
  const [selectedSort, setSelectedSort] = useState<(typeof sortOptions)[number]>("Recommended");
  const [selectedGender, setSelectedGender] = useState<(typeof genders)[number]>("Any");
  const [selectedLocation, setSelectedLocation] = useState<(typeof locationOptions)[number]>("Kolkata");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const priceMin = 300;
  const priceMax = 2500;

  const apiGender = selectedGender === "Male" ? "male" :
                    selectedGender === "Female" ? "female" :
                    selectedGender === "Non-binary" ? "non-binary" : undefined;

  let apiSortBy = "recommended";
  if (selectedSort === "Newest") apiSortBy = "newest";
  if (selectedSort === "Top Rated") apiSortBy = "top_rated";

  // Combine chip and selected interests
  const allInterests = [...selectedInterests];
  if (selectedChip !== "All" && selectedChip !== "More" && !allInterests.includes(selectedChip)) {
    allInterests.push(selectedChip);
  }

  const { companions: filteredBuddies, pagination, isLoading, error } = useCompanions({
    gender: apiGender,
    city: selectedLocation === "Kolkata" ? "Kolkata" : undefined,
    page: currentPage,
    limit: 12,
    maxPrice,
    sortBy: apiSortBy,
    interests: allInterests.length > 0 ? allInterests.join(",") : undefined,
    languages: selectedLanguages.length > 0 ? selectedLanguages.join(",") : undefined,
  });

  const toggleLanguage = (language: string) => {
    setCurrentPage(1);
    setSelectedLanguages((current) =>
      current.includes(language)
        ? current.filter((value) => value !== language)
        : [...current, language]
    );
  };

  const toggleInterest = (interest: string) => {
    setCurrentPage(1);
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedChip !== "All") count++;
    if (selectedGender !== "Any") count++;
    if (selectedLocation !== "Kolkata") count++;
    if (selectedAge) count++;
    if (maxPrice < 2500) count++;
    count += selectedLanguages.length;
    count += selectedInterests.length;
    return count;
  }, [selectedChip, selectedGender, selectedLocation, selectedAge, maxPrice, selectedLanguages, selectedInterests]);

  const handleReset = () => {
    setSelectedChip("All");
    setSelectedSort("Recommended");
    setSelectedGender("Any");
    setSelectedLocation("Kolkata");
    setSelectedAge("");
    setSelectedLanguages([]);
    setSelectedInterests([]);
    setMaxPrice(2500);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    document.getElementById("buddies-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="w-full min-w-0 overflow-x-hidden p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1500px] rounded-[24px] sm:rounded-[28px] border border-[#f0e0e4] bg-[#f7efe9] p-1.5 sm:p-2 shadow-[0_16px_32px_rgba(77,13,29,0.06)]">
        <section className="overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#efdfdf] bg-[#f7eff0]">
          <div
            className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#f3dfdf] bg-gradient-to-r from-[#f2e8e5] via-[#f3d9e0] to-[#f1e9ea] p-4 sm:p-5"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.08)), linear-gradient(120deg, #f4f0ef 0%, #f3d9df 35%, #f2dfdc 100%)",
            }}
          >
            <div className="absolute inset-y-0 right-0 hidden w-[35%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,.42),transparent_38%)] lg:block" />

            <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[760px]">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a1f39]">
                  Explore Buddies
                </div>
                <h1 className="font-serif text-[32px] sm:text-[48px] xl:text-[62px] leading-[1.05] sm:leading-[0.98] text-[#4b0d1d]">
                  Find Your Ideal <span className="italic text-[#7a1f39]">Buddy</span>
                </h1>
                <p className="mt-2.5 sm:mt-3 max-w-[680px] text-[14px] sm:text-[17px] font-medium text-[#5d2a38]">
                  Skip the awkward small talk. Hire a friend who vibe with your exact hobbies.
                </p>
              </div>

              <div className="hidden w-[210px] shrink-0 xl:block">
                <div className="relative h-[140px] overflow-hidden rounded-[22px] bg-[#dcb8c0]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4d0d1d]/65 via-[#4d0d1d]/15 to-transparent" />
                  <div className="absolute bottom-3 right-3 text-right text-[18px] font-medium italic leading-[1.08] text-[#fff6f7]">
                    Real People.
                    <br />
                    Real Connections.
                    <br />
                    Always.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 sm:mt-5 w-full min-w-0 max-w-full overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => { setSelectedChip(chip); setCurrentPage(1); }}
                    className={`shrink-0 rounded-full border px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                      selectedChip === chip
                        ? "border-[#7a1f39] bg-[#7a1f39] text-white shadow-sm"
                        : "border-[#d5c0c6] bg-white/75 text-[#5a1d2d] hover:bg-white"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] sm:text-[15px] font-semibold text-[#3f1b27]">
            Showing 1-{filteredBuddies.length} of {pagination?.total ?? filteredBuddies.length} buddies
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[#e9d5d9] bg-white px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#5a1d2d] shadow-sm">
              Sort by:
              <select
                value={selectedSort}
                onChange={(event) => { setSelectedSort(event.target.value as (typeof sortOptions)[number]); setCurrentPage(1); }}
                className="bg-transparent font-medium text-[#5a1d2d] outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {/* Mobile / Tablet Filter Trigger Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger
                className="flex items-center gap-2 rounded-full border border-[#e8d8dc] bg-white px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#5a1d2d] shadow-sm transition-colors hover:bg-white/90 active:scale-95 xl:hidden cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5 sm:size-4 text-[#7a1f39]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#7a1f39] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>
              <SheetContent
                side="right"
                className="!fixed !top-0 !bottom-0 !right-0 !inset-y-0 !h-[100dvh] !max-h-[100dvh] !w-full sm:!max-w-md p-0 bg-white sm:bg-[#fff9f8] border-l border-[#f0dfe3] overflow-hidden gap-0 z-50 shadow-2xl"
                showCloseButton={false}
              >
                {/* Header - Fixed top */}
                <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between border-b border-[#f0dfe3] px-5 bg-white z-20">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-base sm:text-lg font-bold text-[#2d111b]">
                      Filter Buddies
                    </SheetTitle>
                    {activeFilterCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#7a1f39] text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs font-semibold text-[#7a1f39] hover:text-[#5a1629] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      Reset
                    </button>
                    <SheetClose className="flex size-8 items-center justify-center rounded-full bg-black/5 text-[#5a1d2d] hover:bg-black/10 transition-colors cursor-pointer">
                      <X className="size-4" />
                      <span className="sr-only">Close filters</span>
                    </SheetClose>
                  </div>
                </div>

                {/* Scrollable Body - Locked between Header and Footer */}
                <div className="absolute top-16 bottom-[76px] inset-x-0 overflow-y-auto overscroll-contain p-4 sm:p-5 pb-8 space-y-5 [-webkit-overflow-scrolling:touch]">
                  <BuddyFilterControls
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    selectedAge={selectedAge}
                    setSelectedAge={setSelectedAge}
                    selectedGender={selectedGender}
                    setSelectedGender={setSelectedGender}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    selectedLanguages={selectedLanguages}
                    toggleLanguage={toggleLanguage}
                    selectedInterests={selectedInterests}
                    toggleInterest={toggleInterest}
                    setCurrentPage={setCurrentPage}
                  />
                </div>

                {/* Fixed Footer - Always pinned at bottom */}
                <div className="absolute bottom-0 inset-x-0 h-[76px] pb-[env(safe-area-inset-bottom,0px)] border-t border-[#f0dfe3] bg-white px-4 flex items-center shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-20">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-[#7a1f39] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#661b2f] active:scale-[0.99] cursor-pointer"
                  >
                    Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div id="buddies-grid" className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[380px] animate-pulse rounded-[22px] border border-[#f0dfe3] bg-white/50" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <p className="mt-1 text-xs text-muted-foreground">Please try again later.</p>
              </div>
            ) : filteredBuddies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-medium text-[#2d111b]">No buddies found</p>
                <p className="mt-1 text-xs text-[#6d4c56]">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredBuddies.map((buddy) => (
                    <BuddyCard key={buddy.id} buddy={buddy} />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="hidden xl:block rounded-[22px] border border-[#f0dfe3] bg-[#fff9f8] p-4 shadow-[0_10px_20px_rgba(122,31,57,0.04)] h-fit sticky top-24">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold text-[#2d111b]">Filter Buddies</h3>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#7a1f39] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-semibold text-[#7a1f39] hover:text-[#5a1629] transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>

            <BuddyFilterControls
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              priceMin={priceMin}
              priceMax={priceMax}
              selectedAge={selectedAge}
              setSelectedAge={setSelectedAge}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedLanguages={selectedLanguages}
              toggleLanguage={toggleLanguage}
              selectedInterests={selectedInterests}
              toggleInterest={toggleInterest}
              setCurrentPage={setCurrentPage}
            />

            <button
              type="button"
              onClick={handleApplyFilters}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7a1f39] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#661b2f] cursor-pointer"
            >
              Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
