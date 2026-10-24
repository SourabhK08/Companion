"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Camera,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  UserRound,
  Users,
  Loader2,
  ArrowRight,
  Eye,
  Edit3,
  Wallet,
  Star,
  Coffee,
  Compass,
  Briefcase,
  Sliders,
  ChevronRight,
  Shield,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import { useProfilePhoto } from "@/hooks/use-profile-photo";
import { useSavedCompanions } from "@/hooks/use-saved-companions";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { useWallet } from "@/hooks/use-wallet";
import { useCompanions } from "@/hooks/use-companions";
import { ImageCarouselModal } from "@/components/shared/image-carousel-modal";
import { PreferencesModal } from "@/components/preferences/preferences-modal";

function CigaretteOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 9h11.5a3 3 0 0 1 3 3v1" />
      <path d="M5.5 13h8.5a2 2 0 0 1 2 2v.5" />
      <path d="M7.5 7.5h9.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M17 6.5v7" />
      <path d="M20 5L6 19" />
    </svg>
  );
}

const tabs = [
  { label: "About", id: "about" },
  { label: "Interests", id: "interests" },
  { label: "Experience", id: "experience" },
] as const;

const tagStyles =
  "inline-flex items-center rounded-full border border-[#e8d7db] bg-[#f8f1f2] px-3 py-1.5 text-[12px] font-medium text-[#6b2d3e]";

const highlightItems = [
  { title: "ID Verified", subtitle: "Government ID & Profile Verified", icon: ShieldCheck },
  { title: "Non-Smoker", subtitle: "Clean & Safe Lifestyle", icon: CigaretteOffIcon },
  { title: "Flexible Hours", subtitle: "Available Weekends & Evenings", icon: Clock3 },
  { title: "Public Meeting", subtitle: "Always in Public Locations", icon: Users },
];


import { ProfileCompleteness } from "@/components/dashboard/profile-completeness";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function calculateAge(dob: string | Date | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { photos, fetchPhotos, galleryPhotos, isLoadingPhotos } = useProfilePhoto();
  const unreadCount = useUnreadCount();
  const { savedIds: savedIdsSet } = useSavedCompanions();
  const { availableInRupees } = useWallet();
  const { companions: recommendedCompanions, isLoading: isLoadingRecommended } = useCompanions({ limit: 4 });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("about");
  const [showAllTags, setShowAllTags] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    } else if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isLoading, isAuthenticated, router, fetchPhotos]);

  const scrollToSection = (id: (typeof tabs)[number]["id"]) => {
    setActiveTab(id);
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const profileTags = user?.interests && user.interests.length > 0 ? user.interests : [];
  const visibleTags = profileTags.slice(0, 4);
  const tagsToRender = showAllTags ? profileTags : visibleTags;
  const remainingTags = profileTags.slice(4);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-berry" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4 lg:px-6 lg:py-5 space-y-6">
      {/* ─── Top Greeting & Quick Actions Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#ebdbe0] bg-gradient-to-r from-white via-[#fff9f9] to-[#fbf4f6] p-4 sm:p-5 shadow-[0_4px_16px_rgba(122,31,57,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fcedf0] px-2.5 py-0.5 text-xs font-semibold text-[#7a1f39]">
              <Sparkles className="size-3 text-[#7a1f39]" />
              {getGreeting()}
            </span>
            <span className="text-xs text-[#8a5d6a] font-medium hidden sm:inline">
              • {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#3d1320]">
            Welcome back, <span className="text-[#7a1f39]">{user?.name?.split(" ")[0] || "Friend"}</span>!
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#6d4955]">
            Explore companions, check active bookings, or personalize your dating preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 flex-wrap">
          <Link
            href="/explore"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full bg-[#7a1f39] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#66192d]"
          >
            <Compass className="size-4" />
            Explore Buddies
          </Link>
          <button
            type="button"
            onClick={() => setPreferencesModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e4d3d7] bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#6a2638] shadow-xs transition-colors hover:bg-[#faf4f6] cursor-pointer"
          >
            <Sliders className="size-3.5" />
            Preferences
          </button>
        </div>
      </div>

      {/* ─── Interactive Quick Stats Ribbon ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Messages Card */}
        <Link
          href="/messages"
          className="group relative overflow-hidden rounded-2xl border border-[#ebdbe0] bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(122,31,57,0.03)] hover:shadow-[0_6px_20px_rgba(122,31,57,0.08)] transition-all hover:border-[#7a1f39]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c525f]">Unread Messages</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#fcedf0] text-[#7a1f39] group-hover:scale-110 transition-transform">
              <MessageSquareText className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-[#3d1320]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="text-[11px] text-[#8a5d6a]">
              {unreadCount === 0 ? "All caught up" : unreadCount === 1 ? "1 message" : `${unreadCount} messages`}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#7a1f39] flex items-center gap-1">
            Open Chat List <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Saved Companions Card */}
        <Link
          href="/saved"
          className="group relative overflow-hidden rounded-2xl border border-[#ebdbe0] bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(122,31,57,0.03)] hover:shadow-[0_6px_20px_rgba(122,31,57,0.08)] transition-all hover:border-[#7a1f39]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c525f]">Saved Companions</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-[#3d1320]">
              {savedIdsSet.size}
            </span>
            <span className="text-[11px] text-[#8a5d6a]">
              {savedIdsSet.size === 1 ? "Bookmarked" : "Bookmarked"}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#7a1f39] flex items-center gap-1">
            Browse Favorites <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Wallet Balance Card */}
        <Link
          href="/wallet"
          className="group relative overflow-hidden rounded-2xl border border-[#ebdbe0] bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(122,31,57,0.03)] hover:shadow-[0_6px_20px_rgba(122,31,57,0.08)] transition-all hover:border-[#7a1f39]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c525f]">Wallet Balance</span>
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <Wallet className="size-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-[#3d1320]">
              ₹{availableInRupees.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Available</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#7a1f39] flex items-center gap-1">
            Manage &amp; Add Funds <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Verification Status Card */}
        <Link
          href="/verify-account"
          className="group relative overflow-hidden rounded-2xl border border-[#ebdbe0] bg-white p-3.5 sm:p-4 shadow-[0_4px_16px_rgba(122,31,57,0.03)] hover:shadow-[0_6px_20px_rgba(122,31,57,0.08)] transition-all hover:border-[#7a1f39]/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c525f]">Trust &amp; Verification</span>
            <div className={`flex size-8 items-center justify-center rounded-full ${user?.isVerified ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600"} group-hover:scale-110 transition-transform`}>
              <BadgeCheck className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-base sm:text-lg font-bold font-serif ${user?.isVerified ? "text-emerald-700" : "text-amber-800"}`}>
              {user?.isVerified ? "100% Verified" : "Needs Verification"}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#7a1f39] flex items-center gap-1">
            {user?.isVerified ? "View Badge Status" : "Verify Phone & Email →"}
          </div>
        </Link>
      </div>

      {user && !user.isCompanion && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-berry/20 bg-gradient-to-r from-berry/10 to-berry/5 shadow-sm">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-berry">Become a Companion! 🌟</h3>
              <p className="mt-1 text-sm text-berry/80">
                Want to earn by meeting new people? List your profile as a companion today!
              </p>
            </div>
            <Link 
              href="/settings?tab=companion" // Or wherever we handle onboarding
              className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-berry/90 w-full sm:w-auto"
            >
              Start Your Journey With Us
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
      
      {user && !user.isCoFounder && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Find Your Co-Founder! 🚀</h3>
              <p className="mt-1 text-sm text-blue-800/80">
                Attach your LinkedIn profile and share your ideas to connect with potential business partners.
              </p>
            </div>
            <Link 
              href="/settings?tab=cofounder"
              className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 w-full sm:w-auto"
            >
              Complete Profile
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
      
      <ProfileCompleteness />
      
      <div className="overflow-hidden rounded-[28px] border border-[#eadfe2] bg-[#f3edeb] shadow-[0_18px_42px_rgba(92,23,50,0.08)]">
        <section className="relative overflow-hidden rounded-[28px] border border-[#efdfe3] bg-[#f6eae8] p-4 sm:p-5 lg:p-6">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08)), linear-gradient(120deg, #f2e5e4 0%, #ebc7d0 36%, #f3d8b5 100%)",
            }}
          />

          <div className="absolute inset-y-0 right-0 hidden w-[38%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,.42),transparent_35%)] lg:block" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 sm:flex-row lg:gap-5">
              {/* Avatar with fallback monogram */}
              <div className="relative shrink-0 overflow-hidden rounded-full border-3 sm:border-4 border-white/90 bg-gradient-to-br from-dusty-rose to-berry shadow-[0_8px_18px_rgba(74,19,35,0.18)] flex items-center justify-center">
                {user?.avatarUrl ? (
                  <div
                    className="size-24 sm:size-28 lg:size-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${user.avatarUrl})` }}
                  />
                ) : (
                  <div className="size-24 sm:size-28 lg:size-32 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold font-serif select-none">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center sm:items-start pt-1 sm:pt-3">
                {user?.isVerified ? (
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm ring-1 ring-emerald-200">
                    <BadgeCheck className="size-3.5 text-emerald-600" />
                    Verified User
                  </div>
                ) : (
                  <Link
                    href="/verify-account"
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-800 backdrop-blur-sm ring-1 ring-amber-300/80 hover:bg-amber-50 transition-colors"
                  >
                    <ShieldCheck className="size-3.5 text-amber-600" />
                    Verify phone &amp; email to get the badge (
                    {Number(!!user?.isPhoneVerified) + Number(!!user?.isEmailVerified)}/2) →
                  </Link>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[#411522]">
                  <h1 className="font-serif text-2xl sm:text-[34px] lg:text-[40px] font-bold leading-tight inline-flex items-center gap-2">
                    {user?.name || "Your Name"}
                    {user?.isVerified && (
                      <BadgeCheck className="size-6 text-sky-600 shrink-0" />
                    )}
                  </h1>
                  <span className="text-lg text-[#7a1f39]">♡</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-[#4f2b36]">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5 sm:size-4 text-[#7a1f39]" />
                    {user?.email}
                  </span>
                </div>

                <p className="mt-2.5 max-w-[620px] text-xs sm:text-sm md:text-base leading-relaxed font-medium text-[#4e2834]">
                  Welcome to your dashboard! Here you can manage your bookings, earnings, and profile. Update your details from the settings page.
                </p>

                <div className="mt-3.5 flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2">
                  {tagsToRender.map((tag) => (
                    <span key={tag} className={tagStyles}>{tag}</span>
                  ))}

                  {remainingTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTags((prev) => !prev)}
                      className="inline-flex items-center rounded-full bg-[#7a1f39] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#66192d]"
                    >
                      {showAllTags ? "Show less" : `+${remainingTags.length} more`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden w-[190px] lg:block">
              <div className="relative h-[130px] overflow-hidden rounded-[22px] border border-white/40 bg-[#dba8b4] shadow-[0_12px_24px_rgba(128,48,72,0.18)]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5f1d2d]/70 via-[#5f1d2d]/15 to-transparent" />
                <div className="absolute inset-x-3 bottom-2 text-right text-[18px] font-medium italic leading-[1.05] text-[#fff3f5]">
                  Good Food
                  <br />
                  Better Company
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-[#eadfe2] bg-[#f5f0ee] px-3 py-2.5 sm:px-4 lg:px-5 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#d8b8c2] bg-[#7a1f39] text-white shadow-sm"
                    : "border-[#e4d3d7] bg-white/60 text-[#4c2632] hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 p-3 sm:p-4 lg:grid-cols-[1.5fr_0.95fr] lg:p-5">
          <div className="space-y-5">
            <section
              id="about"
              ref={(node) => {
                refs.current.about = node;
              }}
              className="scroll-mt-24 rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3 text-[#5d2436]">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f4e6eb] text-[#7a1f39]">
                  <UserRound className="size-4" />
                </div>
                <h2 className="text-[20px] font-bold">About Me</h2>
              </div>

              <p className="text-[15px] leading-7 text-[#4d2a35] whitespace-pre-wrap">
                {user?.bio || "No bio added yet. Go to settings to complete your profile!"}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div
                  id="languages"
                  ref={(node) => {
                    refs.current.languages = node;
                  }}
                  className="rounded-xl border border-[#efdadf] bg-[#f4eaee] p-3"
                >
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#f9eaf0] text-[#7a1f39]">
                    <MessageSquareText className="size-4" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#673448]">Languages</div>
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">
                    {user?.languages && user.languages.length > 0 ? user.languages.join(", ") : "Not set"}
                  </div>
                </div>

                <div className="rounded-xl border border-[#efdadf] bg-[#f4eaee] p-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#f9eaf0] text-[#7a1f39]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#673448]">Age</div>
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">
                    {calculateAge(user?.dateOfBirth) ? `${calculateAge(user?.dateOfBirth)} years` : "Not set"}
                  </div>
                </div>

                <div className="rounded-xl border border-[#efdadf] bg-[#f4eaee] p-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#f9eaf0] text-[#7a1f39]">
                    <MapPin className="size-4" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#673448]">Location</div>
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">
                    {user?.city || "Not set"}
                  </div>
                </div>
              </div>
            </section>

            <section
              id="interests"
              ref={(node) => {
                refs.current.interests = node;
              }}
              className="scroll-mt-24 rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3 text-[#5d2436]">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f4e6eb] text-[#7a1f39]">
                  <Heart className="size-4" />
                </div>
                <h2 className="text-[20px] font-bold">Key Highlights</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {highlightItems.map(({ title, subtitle, icon: Icon }) => (
                  <div key={title} className="rounded-xl border border-[#f0dfe3] bg-[#fff8f7] p-3 text-center">
                    <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-[#f8e4ea] text-[#7a1f39]">
                      <Icon className="size-5" />
                    </div>
                    <div className="text-[14px] font-bold text-[#7a1f39]">{title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-[#624953]">{subtitle}</div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="experience"
              ref={(node) => {
                refs.current.experience = node;
              }}
              className="scroll-mt-24 rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3 text-[#5d2436]">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f4e6eb] text-[#7a1f39]">
                  <Sparkles className="size-4" />
                </div>
                <h2 className="text-[20px] font-bold">Experience &amp; Categories</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {profileTags.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#f0dfe3] bg-white px-3 py-2 text-sm font-medium text-[#6b2d3e]"
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── Recommended Experiences (temporarily commented out) ───
            <section
              id="reviews"
              ref={(node) => {
                refs.current.reviews = node;
              }}
              className="scroll-mt-24 rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-bold text-[#5d2436]">Recommended Experiences</h2>
                <button type="button" className="text-sm font-medium text-[#7a1f39]">
                  View All →
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {[
                  [
                    "Food Walk",
                    "₹799",
                    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
                  ],
                  [
                    "Photography Walk",
                    "₹999",
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
                  ],
                  [
                    "Museum Tour",
                    "₹699",
                    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
                  ],
                ].map(([title, price, image]) => (
                  <article key={title} className="min-w-[220px] overflow-hidden rounded-[18px] border border-[#f0dfe3] bg-white sm:min-w-[230px] lg:min-w-[240px]">
                    <div className="relative h-32 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                      <button
                        type="button"
                        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/80 text-[#7a1f39] backdrop-blur-sm"
                      >
                        <Heart className="size-4" fill="none" />
                      </button>
                    </div>
                    <div className="space-y-3 p-3">
                      <div className="text-[15px] font-semibold text-[#2d111b]">{title}</div>
                      <div className="flex items-center justify-between text-[12px] text-[#5a1d2d]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-[#7a1f39]" /> Kolkata
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#7a1f39]">{price}</span>
                        <button type="button" className="rounded-lg bg-[#7a1f39] px-3 py-2 text-xs font-semibold text-white hover:bg-[#66192d]">
                          Book Now →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            ─── */}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#5d2436]">
                  <Camera className="size-5" />
                  <h2 className="text-[20px] font-bold">Gallery</h2>
                </div>
                <Link
                  href="/settings?tab=photos"
                  className="text-xs sm:text-sm font-semibold text-[#7a1f39] hover:underline"
                >
                  Manage →
                </Link>
              </div>

              {isLoadingPhotos ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-berry" />
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(galleryPhotos.length > 0 ? galleryPhotos : photos)
                    .slice(0, 4)
                    .map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          setCarouselIndex(index);
                          setCarouselOpen(true);
                        }}
                        className="group relative overflow-hidden rounded-[16px] border border-[#f0dfe3] bg-[#f2e9e9] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-berry/40"
                      >
                        <div
                          className="h-28 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${photo.imageUrl || photo.thumbnailUrl || ""})`,
                          }}
                        />
                        {/* Hover hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="rounded-full bg-black/60 p-1.5 text-white backdrop-blur-xs">
                            <Eye className="size-4" />
                          </span>
                        </div>
                        {photo.isProfilePhoto && (
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-berry/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                            Avatar
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#eadfe3] bg-white/70 p-5 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-berry/10 text-berry">
                    <Camera className="size-5" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-bold text-[#4d2a35]">
                    No photos added yet
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6a4953]">
                    Upload photos in Settings to showcase here.
                  </p>
                  <Link
                    href="/settings?tab=photos"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#7a1f39] px-3.5 py-1 text-xs font-semibold text-white hover:bg-[#66192d] transition-colors"
                  >
                    Add Photos
                  </Link>
                </div>
              )}
            </section>

            <section className="rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#5d2436]">
                  <Heart className="size-5 text-[#7a1f39]" />
                  <h2 className="text-[20px] font-bold">What I&apos;m Looking For</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencesModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7a1f39] hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3.5" />
                  Edit
                </button>
              </div>

              <ul className="space-y-3 text-[15px] text-[#4d2832]">
                {(user?.lookingFor && user.lookingFor.length > 0
                  ? user.lookingFor
                  : [
                      "Food & Cafe Experiences",
                      "Photography Walks",
                      "City Exploration",
                      "Festivals & Cultural Events",
                      "Friendly Conversations",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f8e4ea] text-[#7a1f39]">
                      <Check className="size-3.5" />
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ─── Match & Discovery Preferences ─── */}
            <section className="rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#5d2436]">
                  <Sliders className="size-5 text-[#7a1f39]" />
                  <h2 className="text-[20px] font-bold">Your Preferences</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencesModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7a1f39] hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3.5" />
                  Edit
                </button>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-[#4d2832]">
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#eadfe3]">
                  <span className="text-[#6a4953] font-medium">Looking to Meet</span>
                  <span className="font-bold text-[#4d2832] capitalize">
                    {user?.preferredGender === "any" || !user?.preferredGender ? "Anyone" : user.preferredGender}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#eadfe3]">
                  <span className="text-[#6a4953] font-medium">Age Range</span>
                  <span className="font-bold text-[#4d2832]">
                    {user?.preferredAgeMin ?? 18} – {user?.preferredAgeMax ?? 35} yrs
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#eadfe3]">
                  <span className="text-[#6a4953] font-medium">Location</span>
                  <span className="font-bold text-[#4d2832] truncate max-w-[150px]">
                    {user?.preferredLocation || user?.city || "Any City"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#eadfe3]">
                  <span className="text-[#6a4953] font-medium">Languages</span>
                  <span className="font-bold text-[#4d2832] truncate max-w-[150px]">
                    {user?.preferredLanguages && user.preferredLanguages.length > 0
                      ? user.preferredLanguages.join(", ")
                      : "English, Hindi"}
                  </span>
                </div>
              </div>
            </section>

            {/* ─── Meeting OTP (temporarily commented out) ───
            <section className="rounded-[22px] border border-[#f3dfe6] bg-[#f7e9ed] p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-[#5d2436]">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#f0d9df] text-[#7a1f39]">
                  <LockKeyhole className="size-4" />
                </div>
                <h2 className="text-[20px] font-bold">Meeting OTP</h2>
              </div>

              <p className="text-[15px] leading-6 text-[#5d2e3c]">
                OTP will be available 10 minutes before your scheduled meeting time.
              </p>

              <div className="mt-4">
                <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#6e4b57]">
                  Available in
                </div>
                <div className="mt-2 text-[42px] font-bold tracking-tight text-[#7a1f39]">09:42</div>
                <div className="mt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-[#704c59]">
                  Minutes Seconds
                </div>
              </div>

              <div className="mt-4 flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-11 w-9 rounded-md border border-[#d9b7c0] bg-white/40 text-center text-lg font-semibold text-[#7a1f39] leading-[2.7]"
                  >
                    {index === 0 ? "0" : index === 1 ? "9" : ""}
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[13px] leading-6 text-[#5b2d3b]">
                Share this code with Aanya to confirm the meeting has started.
              </p>
            </section>
            ─── */}
          </aside>
        </div>
      </div>

      {/* ─── Explore by Category Hub ─── */}
      <section className="mt-10">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a1f39]">
              <Compass className="size-3.5" />
              Discover Connections
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#411522]">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a1f39] hover:underline"
          >
            View all categories
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/explore/female"
            className="group relative overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-gradient-to-br from-[#fff7f9] to-[#fbf2f4] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#d9a8b5]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a1f39] to-[#992849] text-white shadow-sm group-hover:scale-110 transition-transform">
              <Heart className="size-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#411522] group-hover:text-[#7a1f39] transition-colors">
              Female Companions
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#6a4953]">
              Artisan cafe visits, culinary outings, gallery tours &amp; meaningful conversations.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#7a1f39]">
              <span>Explore profiles</span>
              <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/explore/male"
            className="group relative overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-gradient-to-br from-[#f8f9fc] to-[#f0f3fa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#b8c7e0]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2a4365] to-[#3182ce] text-white shadow-sm group-hover:scale-110 transition-transform">
              <Users className="size-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#1a202c] group-hover:text-[#2b6cb0] transition-colors">
              Male Companions
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#4a5568]">
              Fitness partners, city adventures, sporting events &amp; relaxed casual hangouts.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#2b6cb0]">
              <span>Explore profiles</span>
              <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/explore/queer"
            className="group relative overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-gradient-to-br from-[#faf7fc] to-[#f5edfa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#d6bcfa]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6b46c1] to-[#805ad5] text-white shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="size-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#322659] group-hover:text-[#6b46c1] transition-colors">
              Queer Friendly
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#553c9a]">
              Inclusive, affirming and warm spaces for genuine, judgment-free social connection.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#6b46c1]">
              <span>Explore profiles</span>
              <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/explore/cofounder"
            className="group relative overflow-hidden rounded-[24px] border border-[#f0e3e7] bg-gradient-to-br from-[#f7faf9] to-[#edf7f4] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#9ae6b4]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#234e52] to-[#285e61] text-white shadow-sm group-hover:scale-110 transition-transform">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-[#1d4044] group-hover:text-[#234e52] transition-colors">
              Find a Co-Founder
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[#285e61]">
              Meet passionate entrepreneurs, tech leads &amp; creative minds to build your vision.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#234e52]">
              <span>Explore profiles</span>
              <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ─── Top Rated Companions Around You ─── */}
      <section className="mt-10">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a1f39]">
              <Star className="size-3.5 fill-[#7a1f39]" />
              Featured Members
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#411522]">
              Recommended for You
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7a1f39] hover:underline"
          >
            See all companions
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {isLoadingRecommended ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-[24px] border border-[#f0e3e7] bg-white p-4 space-y-3"
              >
                <div className="h-44 w-full rounded-[18px] bg-[#f2e6ea]" />
                <div className="h-4 w-3/4 rounded bg-[#f2e6ea]" />
                <div className="h-3 w-1/2 rounded bg-[#f2e6ea]" />
                <div className="h-8 w-full rounded-xl bg-[#f2e6ea]" />
              </div>
            ))}
          </div>
        ) : recommendedCompanions && recommendedCompanions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCompanions.map((comp) => (
              <div
                key={comp.id}
                className="group flex flex-col rounded-[24px] border border-[#f0e3e7] bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#d9a8b5]"
              >
                {/* Image / Avatar */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-[#f8e4ea]">
                  {comp.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={comp.avatar}
                      alt={comp.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#7a1f39]/20 to-[#7a1f39]/5 text-3xl font-serif font-bold text-[#7a1f39]">
                      {comp.name.charAt(0)}
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{comp.rating ? comp.rating.toFixed(1) : "5.0"}</span>
                  </div>

                  {/* City Pill */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-[#4d2a35] shadow-sm">
                    <MapPin className="size-3 text-[#7a1f39]" />
                    <span>{comp.city || "Kolkata"}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-serif text-base font-bold text-[#411522] truncate flex items-center gap-1.5">
                        {comp.name}
                        {comp.isVerified && (
                          <BadgeCheck className="size-4 text-sky-600 shrink-0" />
                        )}
                      </h4>
                      <span className="text-xs font-bold text-[#7a1f39] shrink-0">
                        ₹{comp.pricePerHour}/hr
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs text-[#6a4953]">
                      {comp.profession || comp.bio || "Friendly Companion"}
                    </p>

                    {/* Interests pills */}
                    {comp.interests && comp.interests.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {comp.interests.slice(0, 2).map((interest) => (
                          <span
                            key={interest}
                            className="rounded-full bg-[#f8e4ea] px-2 py-0.5 text-[10px] font-medium text-[#7a1f39]"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/companion/${comp.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#7a1f39] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#66192d]"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#f0e3e7] bg-white p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#f8e4ea] text-[#7a1f39]">
              <Compass className="size-7" />
            </div>
            <h3 className="mt-3 font-serif text-lg font-bold text-[#411522]">
              Discover Companions
            </h3>
            <p className="mt-1 max-w-md text-xs sm:text-sm text-[#6a4953]">
              Browse verified companions ready to join you for dining, cafes, events and more.
            </p>
            <Link
              href="/explore"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#7a1f39] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#66192d] transition-colors"
            >
              Browse All Companions
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ─── Popular Meeting Vibes in Your City ─── */}
      <section className="mt-10">
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a1f39]">
            <Coffee className="size-3.5" />
            Curated Experiences
          </div>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#411522]">
            Popular Meeting Vibes
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6a4953]">
            Find companions who match your favorite social activities and weekend plans.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Artisan Cafes", icon: "☕", search: "Cafe" },
            { label: "Street & Heritage Walks", icon: "📸", search: "Photography" },
            { label: "Fine Dining", icon: "🍽️", search: "Food" },
            { label: "Art & Exhibitions", icon: "🎨", search: "Art" },
            { label: "Festivals & Gigs", icon: "🎭", search: "Music" },
            { label: "Fitness & Runs", icon: "🏃", search: "Fitness" },
          ].map((vibe) => (
            <Link
              key={vibe.label}
              href={`/explore?search=${encodeURIComponent(vibe.search)}`}
              className="group flex flex-col items-center justify-center rounded-[20px] border border-[#f0e3e7] bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#7a1f39]/30 hover:shadow-md"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">
                {vibe.icon}
              </span>
              <span className="mt-2 text-xs font-bold text-[#4d2a35] group-hover:text-[#7a1f39] transition-colors">
                {vibe.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Trust, Safety & Community Standards ─── */}
      <section className="mt-10 mb-4 rounded-[28px] border border-[#f0e3e7] bg-gradient-to-br from-[#fdfbfb] via-[#fffbfb] to-[#fbf2f4] p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7a1f39]">
              <Shield className="size-3.5" />
              Safety First
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#411522]">
              Our Trust &amp; Safety Standards
            </h2>
          </div>
          <Link
            href="/verify-account"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#7a1f39] hover:underline"
          >
            Verify your account
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#eadfe3] bg-white/80 p-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-berry/10 text-berry">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#411522]">
              100% Verified Profiles
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6a4953]">
              Every member verifies their phone number, email and selfie identity before unlocking full features.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfe3] bg-white/80 p-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-berry/10 text-berry">
              <MapPin className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#411522]">
              Public Venues Only
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6a4953]">
              All meetups are strictly hosted in verified public locations like cafes, bistros, parks, and cultural spaces.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfe3] bg-white/80 p-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-berry/10 text-berry">
              <Wallet className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#411522]">
              Secure Escrow Wallet
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6a4953]">
              Zero cash surprises. Booking payments are securely held in platform escrow until the meeting starts.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfe3] bg-white/80 p-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-berry/10 text-berry">
              <HeartHandshake className="size-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#411522]">
              24/7 Community Care
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6a4953]">
              Our support and safety team is active around the clock with instant reporting and fast resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Full-Screen Carousel Modal */}
      <ImageCarouselModal
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        images={(galleryPhotos.length > 0 ? galleryPhotos : photos).slice(0, 4).map((p) => ({
          id: p.id,
          url: p.imageUrl || p.thumbnailUrl || "",
          thumbnailUrl: p.thumbnailUrl,
          isProfilePhoto: p.isProfilePhoto,
        }))}
        currentIndex={carouselIndex}
        onNavigate={setCarouselIndex}
      />

      {/* Edit Preferences & Intent Modal */}
      <PreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
      />
    </div>
  );
}
