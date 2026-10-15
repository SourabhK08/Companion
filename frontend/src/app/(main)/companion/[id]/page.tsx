"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BadgeCheck,
  CheckCircle2,
  CalendarDays,
  Star,
  Heart,
  User,
  Briefcase,
  Languages,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Music,
  Coffee,
  Plane,
  Camera as CameraIcon,
  Film,
  Dumbbell,
  Book,
  Laptop,
  SlidersHorizontal,
  ArrowRight,
  MessageCircle,
  CalendarPlus,
  Eye,
  Clock,
  X,
  Sparkles,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { ImageCarouselModal } from "@/components/shared/image-carousel-modal";

// Utility for mapping interest names to icons
const getInterestIcon = (interest: string) => {
  const i = interest.toLowerCase();
  if (i.includes("travel")) return Plane;
  if (i.includes("music")) return Music;
  if (i.includes("food")) return Coffee;
  if (i.includes("photo")) return CameraIcon;
  if (i.includes("movie") || i.includes("film")) return Film;
  if (i.includes("fitness") || i.includes("gym")) return Dumbbell;
  if (i.includes("book")) return Book;
  if (i.includes("tech")) return Laptop;
  return Heart;
};

// Profile navigation tabs mapped directly to actual section IDs
const PROFILE_TABS = [
  { id: "about", label: "About" },
  { id: "interests", label: "Interests" },
  { id: "photos", label: "Photos" },
  { id: "badges", label: "Badges & Trust" },
];

/**
 * Custom interactive tooltip for preference rows to guarantee 100% readability of long text
 */
function PreferenceTooltip({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center justify-between group py-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && value && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 mb-2 z-40 w-max max-w-[280px] sm:max-w-[320px] rounded-xl bg-[#2d111b] px-3.5 py-2 text-xs text-white shadow-xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
          <p className="font-semibold text-[#f4dbe2] text-[11px] mb-0.5">{label}</p>
          <p className="leading-snug break-words text-white font-medium">{value}</p>
          <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-[#2d111b]" />
        </div>
      )}
    </div>
  );
}

/**
 * Custom tooltip for pills & chips
 */
function ChipTooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 w-max max-w-[240px] rounded-lg bg-[#2d111b] px-3 py-1.5 text-xs text-white shadow-lg animate-in fade-in duration-150"
        >
          <span className="leading-tight break-words">{content}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#2d111b]" />
        </div>
      )}
    </div>
  );
}

export default function CompanionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { companion, isLoading, error } = useCompanion(resolvedParams.id);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  // const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Scroll to top immediately when route ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [resolvedParams.id]);

  // Ensure scroll position is firmly reset to top once async companion data finishes loading
  useEffect(() => {
    if (!isLoading && companion) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isLoading, companion]);

  // Sync active tab with user scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const tab of PROFILE_TABS) {
        const el = document.getElementById(tab.id);
        if (el) {
          const top = el.offsetTop - 150;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveTab(tab.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // const handleSendMessage = async () => {
  //   if (!companion?.userId) return;
  //   try {
  //     setIsSendingMessage(true);
  //     const res = await apiFetch<{ success: boolean; data: { conversation: { id: string } } }>(
  //       "/api/chat/conversations",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ recipientId: companion.userId }),
  //       }
  //     );
  //     if (res.success && res.data?.conversation?.id) {
  //       router.push(`/messages?chat=${res.data.conversation.id}`);
  //     }
  //   } catch (err) {
  //     console.error("Failed to start conversation", err);
  //   } finally {
  //     setIsSendingMessage(false);
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
          <p className="text-sm font-medium text-[#7a1f39]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldAlert className="size-10 text-red-500" />
          <h2 className="text-xl font-bold text-[#2d111b]">Profile Not Found</h2>
          <p className="text-sm text-[#6a4953]">{error || "The requested profile does not exist."}</p>
          <Link 
            href="/explore" 
            className="mt-4 flex h-10 items-center justify-center rounded-full bg-[#7a1f39] px-6 text-sm font-medium text-white transition-colors hover:bg-[#661b2f]"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Prevent users from viewing or booking their own profile as a companion
  if (companion && user && companion.userId === user.id) {
    return (
      <div className="flex h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8 bg-white rounded-2xl border border-[#f0dfe3] shadow-sm">
          <div className="size-16 rounded-full bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39]">
            <User className="size-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d111b]">This is your profile</h2>
            <p className="mt-1.5 text-sm text-[#6a4953] leading-relaxed">
              You cannot view or book your own profile as a companion. You can manage and update your details, photos, and preferences in Settings.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-full bg-[#7a1f39] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#661b2f] shadow-sm"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  const isCompanionUser = companion.isCompanion === true && companion.pricePerHour > 0;

  return (
    <main className="min-h-screen bg-[#faf5f6] pb-20 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* ─── BANNER SECTION ─── */}
      <div className="relative h-[240px] w-full overflow-hidden bg-gradient-to-r from-[#fbeaf0] to-[#f4dbe2]">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 10% 80%, #7a1f39 1px, transparent 1px), radial-gradient(circle at 90% 20%, #7a1f39 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
        <div className="absolute bottom-6 right-12 hidden text-right md:block">
          <p className="font-serif text-3xl italic tracking-tight text-[#7a1f39]/30">
            More Connections
            <br />
            More Stories ♡
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 w-full min-w-0">
        {/* ─── PROFILE HEADER ─── */}
        <div className="relative -mt-20 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#f0dfe3]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md sm:size-40 bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] flex items-center justify-center text-white text-3xl sm:text-4xl font-bold font-serif select-none">
              {companion.avatar ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${companion.avatar})` }}
                />
              ) : (
                <span>
                  {companion.name
                    ? companion.name
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "C"}
                </span>
              )}
            </div>
            <div className="mb-2">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[#2d111b] sm:text-3xl">
                {companion.name}
                {companion.isVerified && <BadgeCheck className="size-6 text-[#7a1f39]" />}
              </h1>
              
              <p className="mt-1 font-medium text-[#7a1f39]">
                {isCompanionUser
                  ? `₹${companion.pricePerHour}/hr • Companion`
                  : "Explore Buddy • Community Member"}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#6a4953]">
                <MapPin className="size-4" />
                {companion.city}, West Bengal
              </div>

              {/* {companion.profession && (
                <p className="mt-3 text-sm italic text-[#4a2b35]">
                  "{companion.profession.slice(0, 70)}"
                </p>
              )} */}
              
              <div className="mt-4 flex flex-wrap gap-2">
                {["Friendly", "Respectful", "Verified Profile"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1 rounded-full bg-[#f9eef1] px-3 py-1 text-xs font-semibold text-[#7a1f39]">
                    <Sparkles className="size-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end sm:self-start sm:mt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* <Button
                type="button"
                onClick={handleSendMessage}
                disabled={isSendingMessage}
                variant="outline"
                className="rounded-full border-[#7a1f39] text-[#7a1f39] hover:bg-[#7a1f39]/10 font-semibold cursor-pointer active:scale-95 transition-all"
              >
                <MessageCircle className="mr-2 size-4" />
                {isSendingMessage ? "Opening..." : "Send Message"}
              </Button> */}

              {isCompanionUser && (
                <Button
                  type="button"
                  onClick={() => router.push(`/bookings/checkout?companion=${companion.id}`)}
                  className="rounded-full bg-[#7a1f39] text-white hover:bg-[#661b2f] font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  <CalendarPlus className="mr-2 size-4" />
                  Book Now • ₹{companion.pricePerHour}/hr
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="mt-8 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full min-w-0">
          <div className="flex gap-8 border-b border-[#f0dfe3] w-max">
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`whitespace-nowrap pb-4 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#7a1f39] text-[#7a1f39]"
                    : "text-[#6a4953] hover:text-[#2d111b]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          {/* ─── LEFT COLUMN ─── */}
          <div className="flex-1 space-y-6 min-w-0">
            
            {/* About Me */}
            <div id="about" className="scroll-mt-24 rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <User className="size-5 text-[#7a1f39]" />
                  About Me
                </h3>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-[#4a2b35]">
                {companion.bio || "No detailed bio provided yet."}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-[#fdfafb] p-5 border border-[#f4dbe2]">
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <User className="size-4" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#6a4953]">Age</p>
                  <p className="text-sm sm:text-base font-bold text-[#2d111b]">{companion.age}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Activity className="size-4" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#6a4953]">Gender</p>
                  <p className="text-sm sm:text-base font-bold text-[#2d111b] capitalize">{companion.gender || "Not specified"}</p>
                </div>
                {/* <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Briefcase className="size-4" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#6a4953]">Occupation</p>
                  <p className="text-sm sm:text-base font-bold text-[#2d111b] leading-tight truncate">{companion.profession}</p>
                </div> */}
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Languages className="size-4" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#6a4953]">Languages</p>
                  <p className="text-sm sm:text-base font-bold text-[#2d111b] leading-tight truncate">{companion.languages.join(", ") || "Hindi, English"}</p>
                </div>
              </div>
            </div>

            {/* My Interests & What I'm Looking For */}
            <div id="interests" className="scroll-mt-24 rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <Heart className="size-5 text-[#7a1f39]" />
                  My Interests
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {companion.interests && companion.interests.length > 0 ? (
                    companion.interests.map((interest) => {
                      const Icon = getInterestIcon(interest);
                      return (
                        <div key={interest} className="flex items-center gap-2 rounded-full bg-[#fdfafb] border border-[#f0dfe3] px-4 py-2">
                          <Icon className="size-4 text-[#7a1f39] shrink-0" />
                          <span className="text-sm font-semibold text-[#2d111b] truncate">{interest}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#8a6e74] italic col-span-full">No interests listed yet.</p>
                  )}
                </div>
              </div>

              {/* What I'm Looking For */}
              {companion.lookingFor && companion.lookingFor.length > 0 && (
                <div className="pt-5 border-t border-[#f0dfe3]">
                  <h4 className="flex items-center gap-2 text-base font-bold text-[#2d111b] mb-3">
                    <Sparkles className="size-4 text-[#7a1f39]" />
                    What {companion.name.split(" ")[0]} Is Looking For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {companion.lookingFor.map((item) => (
                      <ChipTooltip key={item} content={`Looking for ${item}`}>
                        <span className="rounded-full bg-[#f9eef1] border border-[#f4dbe2] px-3.5 py-1.5 text-xs font-semibold text-[#7a1f39] transition-colors hover:bg-[#7a1f39] hover:text-white cursor-help">
                          {item}
                        </span>
                      </ChipTooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photos */}
            <div id="photos" className="scroll-mt-24 rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <CameraIcon className="size-5 text-[#7a1f39]" />
                  Photos
                </h3>
                <span className="text-xs font-semibold text-[#7a1f39]">
                  {companion.galleryPhotos && companion.galleryPhotos.length > 0
                    ? `${companion.galleryPhotos.length} photo${companion.galleryPhotos.length > 1 ? "s" : ""}`
                    : companion.avatar
                      ? "1 photo"
                      : "0 photos"}
                </span>
              </div>

              {(() => {
                const allPhotos =
                  companion.galleryPhotos && companion.galleryPhotos.length > 0
                    ? companion.galleryPhotos
                    : companion.avatar
                      ? [{ id: "avatar", imageUrl: companion.avatar, thumbnailUrl: companion.avatar, isProfilePhoto: true }]
                      : [];

                if (allPhotos.length === 0) {
                  return (
                    <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#f0dfe3] bg-[#fdfafb] py-8 text-center">
                      <CameraIcon className="size-8 text-[#7a1f39]/40" />
                      <p className="mt-2 text-sm font-semibold text-[#2d111b]">No photos shared yet</p>
                      <p className="mt-0.5 text-xs text-[#6a4953]">This user hasn&apos;t uploaded gallery photos.</p>
                    </div>
                  );
                }

                return (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {allPhotos.map((p, idx) => (
                      <button
                        key={p.id || idx}
                        type="button"
                        onClick={() => {
                          setCarouselIndex(idx);
                          setCarouselOpen(true);
                        }}
                        className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-[#f0dfe3] shadow-xs cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#7a1f39]/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl || p.thumbnailUrl || companion.avatar || ""}
                          alt={`${companion.name} photo ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="rounded-full bg-black/60 p-1.5 text-white backdrop-blur-xs">
                            <Eye className="size-4" />
                          </span>
                        </div>
                        {p.isProfilePhoto && (
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[#7a1f39]/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                            Avatar
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="w-full space-y-6 lg:w-[320px] xl:w-[360px] shrink-0">
            
            {/* Account Verification & Trust Badges */}
            <div id="badges" className="scroll-mt-24 rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                  <ShieldCheck className="size-5 text-[#7a1f39]" />
                  Account Verification
                </h3>
                {companion.isVerified || (companion.isPhoneVerified && companion.isEmailVerified) ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Verified
                  </span>
                ) : companion.isPhoneVerified || companion.isEmailVerified ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                    <ShieldCheck className="size-3.5" /> Partial
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500">
                    <Clock className="size-3.5" /> Pending
                  </span>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                {/* Phone verification */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                      companion.isPhoneVerified
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {companion.isPhoneVerified ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d111b]">
                      {companion.isPhoneVerified ? "Phone Number Verified" : "Phone Number Unverified"}
                    </p>
                    <p className="text-xs text-[#6a4953]">
                      {companion.isPhoneVerified ? "Confirmed via SMS OTP" : "Pending phone verification"}
                    </p>
                  </div>
                </div>

                {/* Email verification */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                      companion.isEmailVerified
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {companion.isEmailVerified ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d111b]">
                      {companion.isEmailVerified ? "Email Address Verified" : "Email Address Unverified"}
                    </p>
                    <p className="text-xs text-[#6a4953]">
                      {companion.isEmailVerified ? "Confirmed via Email OTP" : "Pending email verification"}
                    </p>
                  </div>
                </div>

                
              </div>
            </div>

            {/* Profile Stats — Dynamic based on companion vs buddy */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                <Activity className="size-5 text-[#7a1f39]" />
                {isCompanionUser ? "Companion Stats" : "Profile Overview"}
              </h3>
              
              {isCompanionUser ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">₹{companion.pricePerHour}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Hourly Rate</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <Star className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">{companion.reviews}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Reviews</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fff8e1] p-4 border border-[#fce9ad]">
                    <div className="flex items-center gap-3">
                      <Star className="size-6 text-[#f59e0b] fill-[#f59e0b]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">{companion.rating}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Rating</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <Activity className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">{companion.responseRate}%</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Response</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-6 text-[#7a1f39]" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#2d111b] truncate">{companion.city}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Location</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <Languages className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">{companion.languages.length || 2}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Languages</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <Heart className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-lg font-bold text-[#2d111b]">{companion.interests.length || 3}</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Interests</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-6 text-[#7a1f39]" />
                      <div>
                        <p className="text-sm font-bold text-[#2d111b]">Active</p>
                        <p className="text-xs font-semibold text-[#6a4953]">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preferences with Custom Readability Tooltips */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                  <SlidersHorizontal className="size-5 text-[#7a1f39]" />
                  {`${companion.name.split(" ")[0]}'s Preferences`}
                </h3>
              </div>

              <div className="mt-5 space-y-3.5">
                {[
                  {
                    icon: User,
                    label: "Gender Preference",
                    value: companion.preferredGender || "Open to All",
                  },
                  {
                    icon: Activity,
                    label: "Age Range",
                    value: `${companion.preferredAgeMin ?? 18} - ${companion.preferredAgeMax ?? 35} years`,
                  },
                  {
                    icon: MapPin,
                    label: "Location",
                    value: companion.preferredLocation || `${companion.city} (Within 20 km)`,
                  },
                  {
                    icon: Languages,
                    label: "Languages",
                    value:
                      companion.preferredLanguages && companion.preferredLanguages.length > 0
                        ? companion.preferredLanguages.join(", ")
                        : companion.languages.join(", ") || "Hindi, English",
                  },
                  {
                    icon: Heart,
                    label: "Interests",
                    value:
                      companion.interests && companion.interests.length > 0
                        ? companion.interests.join(", ")
                        : "Travel, Music, Food",
                  },
                ].map((pref) => (
                  <PreferenceTooltip key={pref.label} label={pref.label} value={pref.value}>
                    <div className="flex items-center gap-3 shrink-0">
                      <pref.icon className="size-4 text-[#7a1f39]" />
                      <span className="text-sm font-medium text-[#6a4953]">{pref.label}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 max-w-[160px] sm:max-w-[200px] justify-end">
                      <span className="text-sm font-semibold text-[#2d111b] truncate text-right cursor-help">
                        {pref.value}
                      </span>
                    </div>
                  </PreferenceTooltip>
                ))}
              </div>
            </div>

            {/* Safety Matters */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbeaf0] to-[#f4dbe2] p-6 shadow-sm border border-[#f0dfe3]">
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-6 text-[#7a1f39]" />
                  <h3 className="text-base font-bold text-[#2d111b]">Your Safety Matters</h3>
                </div>
                <p className="mt-2 text-sm text-[#6a4953] leading-relaxed">
                  Every connection is verified for a secure and respectful experience.
                </p>
                <Link href="/about" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#7a1f39] hover:underline">
                  Learn More <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Full-Screen Carousel Modal */}
      <ImageCarouselModal
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        images={(companion.galleryPhotos && companion.galleryPhotos.length > 0
          ? companion.galleryPhotos
          : companion.avatar
            ? [{ id: "avatar", imageUrl: companion.avatar, thumbnailUrl: companion.avatar, isProfilePhoto: true }]
            : []
        ).map((p) => ({
          id: p.id,
          url: p.imageUrl || p.thumbnailUrl || companion.avatar || "",
          thumbnailUrl: p.thumbnailUrl,
          isProfilePhoto: p.isProfilePhoto,
        }))}
        currentIndex={carouselIndex}
        onNavigate={setCarouselIndex}
      />
    </main>
  );
}
