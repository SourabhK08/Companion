"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  Briefcase,
  Zap,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { CoFounderCard } from "@/components/cofounders/cofounder-card";
import { ChatPassModal } from "@/components/cofounders/chat-pass-modal";
import { useCoFounders } from "@/hooks/use-cofounders";
import { useStartCoFounderChat } from "@/hooks/use-start-cofounder-chat";
import { workInterestOptions } from "@/config/cofounder-data";

function CoFounderFilterControls({
  selectedInterests,
  toggleInterest,
  idPrefix = "filter",
}: {
  selectedInterests: string[];
  toggleInterest: (interest: string) => void;
  idPrefix?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground">Work Interests</label>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">
        Select disciplines to match with complementary skills.
      </p>
      <div className="space-y-2.5">
        {workInterestOptions.map((interest) => (
          <div key={interest} className="flex items-center gap-2.5">
            <Checkbox
              id={`${idPrefix}-interest-${interest}`}
              checked={selectedInterests.includes(interest)}
              onCheckedChange={() => toggleInterest(interest)}
              className="border-soft-border data-checked:bg-berry data-checked:border-berry"
            />
            <Label
              htmlFor={`${idPrefix}-interest-${interest}`}
              className="text-sm text-muted-foreground font-normal cursor-pointer"
            >
              {interest}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExploreCoFounderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const perPage = 12;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // basic debounce
    if ((window as any)._searchTimer) clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
  };

  const { profiles, pagination, isLoading, error } = useCoFounders({
    search: debouncedSearch || undefined,
    workInterests: selectedInterests,
    page: currentPage,
    limit: perPage,
  });

  const chat = useStartCoFounderChat();

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  function toggleInterest(interest: string) {
    setCurrentPage(1);
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    count += selectedInterests.length;
    return count;
  }, [searchQuery, selectedInterests]);

  const handleReset = () => {
    setSelectedInterests([]);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    document.getElementById("cofounders-grid")?.scrollIntoView({ behavior: "smooth" });
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
        <div className="absolute inset-0 bg-gradient-to-r from-deep-plum/95 via-deep-plum/70 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14 w-full min-w-0">
          <div className="max-w-lg min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-dusty-rose/80 sm:text-xs">
              Professional Networking
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Find Your Ideal
              <br />
              <span className="italic text-dusty-rose">Co-Founder / Partner</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              If you have any work idea and want a serious suitable person or team to execute the idea, this section is for you.
              Explore profiles, find ideal work interests, and start chatting for just ₹9 per week.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { icon: Briefcase, label: "LinkedIn Verified", sub: "Professional Profiles" },
                { icon: Lightbulb, label: "Share Ideas", sub: "Pitch your vision" },
                { icon: Zap, label: "Instant Chat", sub: "Unlimited with Pass" },
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
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-6 shrink-0">
            <p className="font-serif text-2xl italic text-white/20 leading-tight text-right xl:text-3xl">
              Great Companies
              <br />
              Start Here
            </p>
            <Link
              href="/settings?tab=cofounder"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-deep-plum shadow-lg transition-colors hover:bg-dusty-rose hover:text-deep-plum"
            >
              Create Your Profile
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between w-full min-w-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Connect with Builders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover professionals sharing their ideas and work interests.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search ideas, interests, or names..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 rounded-xl border-soft-border bg-white pl-10 text-sm focus-visible:border-berry focus-visible:ring-berry/20"
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
                      Filter Co-Founders
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
                  <CoFounderFilterControls
                    selectedInterests={selectedInterests}
                    toggleInterest={toggleInterest}
                    idPrefix="sheet"
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

        {/* Your status — your own card is hidden from the list */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-soft-border bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", chat.hasProfile ? "bg-emerald-500" : "bg-amber-400")} />
              {chat.hasProfile ? "Your Co-Founder profile is live" : "Your Co-Founder profile isn't created yet"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", chat.hasActivePass ? "bg-emerald-500" : "bg-muted-foreground/40")} />
              {chat.hasActivePass && chat.subscription
                ? `Chat Pass active till ${new Date(chat.subscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                : "No active Chat Pass"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings?tab=cofounder&next=/explore/cofounder"
              className="rounded-full border border-soft-border px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {chat.hasProfile ? "Edit My Profile" : "Create Profile"}
            </Link>
            {chat.hasProfile && !chat.hasActivePass && (
              <button
                onClick={chat.openPassModal}
                className="rounded-full bg-deep-plum px-4 py-1.5 text-xs font-semibold text-white hover:bg-berry-dark"
              >
                Get Chat Pass · ₹9/week
              </button>
            )}
          </div>
        </div>

        {chat.error && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {chat.error}
            <button onClick={chat.clearError} className="font-semibold">Dismiss</button>
          </div>
        )}

        <div id="cofounders-grid" className="mt-8 flex flex-col gap-6 xl:flex-row">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: perPage }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl border border-soft-border bg-muted/30" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <Users className="size-6" />
                </div>
                <p className="text-sm font-medium text-foreground">No profiles found</p>
                <p className="mt-1 text-xs text-muted-foreground">Adjust your filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {profiles.map((profile) => (
                  <CoFounderCard key={profile.id} profile={profile} onMessage={chat.startChat} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Sidebar (Desktop only, sticky) */}
          <aside className="hidden xl:block w-full shrink-0 xl:w-[260px] h-fit sticky top-24">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Filter</h3>
                  {activeFilterCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-berry text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-berry hover:text-berry-dark transition-colors cursor-pointer"
                  onClick={handleReset}
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              </div>
              <CoFounderFilterControls
                selectedInterests={selectedInterests}
                toggleInterest={toggleInterest}
                idPrefix="sidebar"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* Global Modals via hooks */}
      <ChatPassModal
        open={chat.passModalOpen}
        onClose={chat.closePassModal}
        onSubscribe={chat.subscribe}
        onSuccess={chat.handlePassPurchased}
      />
    </div>
  );
}
