"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, RotateCcw, ArrowRight, Lightbulb, Briefcase, Zap } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CoFounderCard } from "@/components/cofounders/cofounder-card";
import { ChatPassModal } from "@/components/cofounders/chat-pass-modal";
import { useCoFounders } from "@/hooks/use-cofounders";
import { useStartCoFounderChat } from "@/hooks/use-start-cofounder-chat";
import { workInterestOptions } from "@/config/cofounder-data";

export default function ExploreCoFounderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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
        <div className="absolute inset-0 bg-gradient-to-r from-deep-plum/95 via-deep-plum/70 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-10 lg:px-8 lg:py-14">
          <div className="max-w-lg">
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
                  <div className="flex size-7 items-center justify-center rounded-full bg-white/10">
                    <badge.icon className="size-3.5 text-dusty-rose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-white/80">{badge.label}</p>
                    <p className="text-[9px] text-white/50">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-6">
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
      <section className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Connect with Builders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover professionals sharing their ideas and work interests.
            </p>
          </div>
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search ideas, interests, or names..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-10 rounded-xl border-soft-border bg-white pl-10 text-sm focus-visible:border-berry focus-visible:ring-berry/20"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 xl:flex-row">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

          {/* Sidebar */}
          <aside className="w-full shrink-0 xl:w-[260px]">
            <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Filter</h3>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-berry hover:text-berry-dark"
                  onClick={() => setSelectedInterests([])}
                >
                  Reset <RotateCcw className="size-3" />
                </button>
              </div>
              <div className="mt-5">
                <label className="text-sm font-semibold text-foreground">Work Interests</label>
                <div className="mt-3 space-y-2.5">
                  {workInterestOptions.map((interest) => (
                    <div key={interest} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={selectedInterests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                        className="border-soft-border data-checked:bg-berry data-checked:border-berry"
                      />
                      <Label htmlFor={`interest-${interest}`} className="text-sm text-muted-foreground font-normal cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
