"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BadgeCheck,
  Edit2,
  MoreVertical,
  CheckCircle2,
  CalendarDays,
  Star,
  Heart,
  User,
  Briefcase,
  Languages,
  ChevronRight,
  ShieldAlert,
  Camera,
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
  CalendarPlus
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCompanion } from "@/hooks/use-companion";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

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

export default function CompanionProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { companion, isLoading, error } = useCompanion(resolvedParams.id);

  const handleSendMessage = async () => {
    if (!companion) return;
    try {
      // companion.id is the CompanionProfile ID — we need the userId
      // The useCompanion hook returns companion data that has a userId or we derive from context
      const res = await apiFetch<{ success: boolean; data: { conversation: { id: string } } }>(
        "/api/chat/conversations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: companion.userId }),
        }
      );
      if (res.success) {
        router.push(`/messages?chat=${res.data.conversation.id}`);
      }
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

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

  return (
    <main className="min-h-screen bg-[#faf5f6] pb-20">
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

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* ─── PROFILE HEADER ─── */}
        <div className="relative -mt-20 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#f0dfe3]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md sm:size-40">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${companion.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80'})` }}
              />
              <button className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-[#7a1f39] text-white shadow-sm hover:bg-[#661b2f]">
                <Camera className="size-4" />
              </button>
            </div>
            <div className="mb-2">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-[#2d111b] sm:text-3xl">
                {companion.name}
                {companion.isVerified && <BadgeCheck className="size-6 text-[#7a1f39]" />}
              </h1>
              <p className="mt-1 font-medium text-[#7a1f39]">Verified User</p>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#6a4953]">
                <MapPin className="size-4" />
                {companion.city}, West Bengal
              </div>
              <p className="mt-3 text-sm italic text-[#4a2b35]">
                "{companion.profession.slice(0, 60)}..."
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {["Friendly", "Respectful", "Fun Loving"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1 rounded-full bg-[#f9eef1] px-3 py-1 text-xs font-semibold text-[#7a1f39]">
                    <ShieldAlert className="size-3" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-end sm:self-start sm:mt-4">
            {/* Show Send Message + Book Now for other users, Edit Profile for self */}
            {companion.userId && companion.userId !== user?.id ? (
              <>
                <Button
                  onClick={() => router.push(`/bookings/checkout?companion=${companion.id}`)}
                  className="rounded-full bg-[#7a1f39] text-white hover:bg-[#5a1129]"
                >
                  <CalendarPlus className="mr-2 size-4" />
                  Book Now
                </Button>
                <Button
                  onClick={handleSendMessage}
                  variant="outline"
                  className="rounded-full border-[#7a1f39] text-[#7a1f39] hover:bg-[#7a1f39]/5"
                >
                  <MessageCircle className="mr-2 size-4" />
                  Message
                </Button>
              </>
            ) : (
              <Button variant="outline" className="rounded-full border-[#7a1f39] text-[#7a1f39] hover:bg-[#7a1f39]/5">
                <Edit2 className="mr-2 size-4" />
                Edit Profile
              </Button>
            )}
            <button className="flex size-10 items-center justify-center rounded-full border border-[#f0dfe3] text-[#6a4953] hover:bg-gray-50">
              <MoreVertical className="size-5" />
            </button>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="mt-8 flex gap-8 border-b border-[#f0dfe3] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["About", "Interests", "Photos", "Reviews", "Badges"].map((tab, idx) => (
            <button
              key={tab}
              className={`whitespace-nowrap pb-4 text-sm font-semibold transition-colors ${
                idx === 0
                  ? "border-b-2 border-[#7a1f39] text-[#7a1f39]"
                  : "text-[#6a4953] hover:text-[#2d111b]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          {/* ─── LEFT COLUMN ─── */}
          <div className="flex-1 space-y-6">
            
            {/* About Me */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <User className="size-5 text-[#7a1f39]" />
                  About Me
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#7a1f39]">
                  <Edit2 className="size-3" /> Edit
                </button>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-[#4a2b35]">
                {companion.bio}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-[#fdfafb] p-5 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <User className="size-4" />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#6a4953]">Age</p>
                  <p className="font-bold text-[#2d111b]">{companion.age}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Activity className="size-4" />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#6a4953]">Height</p>
                  <p className="font-bold text-[#2d111b]">5'8"</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Briefcase className="size-4" />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#6a4953]">Occupation</p>
                  <p className="font-bold text-[#2d111b] leading-tight">{companion.profession}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#f4dbe2] text-[#7a1f39]">
                    <Languages className="size-4" />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#6a4953]">Language</p>
                  <p className="font-bold text-[#2d111b] leading-tight">{companion.languages.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* My Interests */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <Heart className="size-5 text-[#7a1f39]" />
                  My Interests
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#7a1f39]">
                  <Edit2 className="size-3" /> Edit
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {companion.interests.map((interest) => {
                  const Icon = getInterestIcon(interest);
                  return (
                    <div key={interest} className="flex items-center gap-2 rounded-full bg-[#fdfafb] border border-[#f0dfe3] px-4 py-2">
                      <Icon className="size-4 text-[#7a1f39]" />
                      <span className="text-sm font-semibold text-[#2d111b]">{interest}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#2d111b]">
                  <CameraIcon className="size-5 text-[#7a1f39]" />
                  Photos
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#7a1f39]">
                  View All <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img 
                      src={`https://images.unsplash.com/photo-152${i}504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80`}
                      alt="Gallery" 
                      className="h-full w-full object-cover transition-transform hover:scale-110"
                    />
                  </div>
                ))}
                <div className="flex aspect-square items-center justify-center rounded-xl bg-[#2d111b] text-white">
                  <div className="text-center">
                    <p className="text-xl font-bold">+12</p>
                    <p className="text-[10px]">More Photos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <div className="w-full space-y-6 lg:w-[320px] xl:w-[360px] shrink-0">
            
            {/* Account Verification */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                  <ShieldAlert className="size-5 text-[#7a1f39]" />
                  Account Verification
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="size-3" /> Verified
                </span>
              </div>
              
              <div className="mt-6 space-y-5 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-emerald-100">
                <div className="relative flex items-start gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white z-10">
                    <CheckCircle2 className="size-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d111b]">Phone Number Verified</p>
                    <p className="text-xs text-[#6a4953]">+91 98765 43210</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white z-10">
                    <CheckCircle2 className="size-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d111b]">Email Verified</p>
                    <p className="text-xs text-[#6a4953]">user@example.com</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white z-10">
                    <CheckCircle2 className="size-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d111b]">Profile Photo Verified</p>
                    <p className="text-xs text-[#6a4953]">Face matched successfully</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                <Activity className="size-5 text-[#7a1f39]" />
                Profile Stats
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="size-6 text-[#7a1f39]" />
                    <div>
                      <p className="text-lg font-bold text-[#2d111b]">12</p>
                      <p className="text-[10px] font-semibold text-[#6a4953]">Total Bookings</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                  <div className="flex items-center gap-3">
                    <Star className="size-6 text-[#7a1f39]" />
                    <div>
                      <p className="text-lg font-bold text-[#2d111b]">{companion.reviews}</p>
                      <p className="text-[10px] font-semibold text-[#6a4953]">Reviews Received</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#fff8e1] p-4 border border-[#fce9ad]">
                  <div className="flex items-center gap-3">
                    <Star className="size-6 text-[#f59e0b] fill-[#f59e0b]" />
                    <div>
                      <p className="text-lg font-bold text-[#2d111b]">{companion.rating}</p>
                      <p className="text-[10px] font-semibold text-[#6a4953]">Average Rating</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#fdfafb] p-4 border border-[#f4dbe2]">
                  <div className="flex items-center gap-3">
                    <Heart className="size-6 text-[#7a1f39]" />
                    <div>
                      <p className="text-lg font-bold text-[#2d111b]">3</p>
                      <p className="text-[10px] font-semibold text-[#6a4953]">Saved Companions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Preferences */}
            <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[#2d111b]">
                  <SlidersHorizontal className="size-5 text-[#7a1f39]" />
                  Your Preferences
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#7a1f39]">
                  <Edit2 className="size-3" /> Edit
                </button>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { icon: User, label: "Gender Preference", value: "Female" },
                  { icon: Activity, label: "Age Range", value: "18 - 35 years" },
                  { icon: MapPin, label: "Location Preference", value: "Kolkata (Within 20 km)" },
                  { icon: Languages, label: "Languages", value: "Hindi, English" },
                  { icon: Heart, label: "Interests", value: "Travel, Cricket, Music, Food" }
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <pref.icon className="size-4 text-[#7a1f39]" />
                      <span className="text-sm font-medium text-[#6a4953]">{pref.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2d111b] max-w-[120px] truncate">{pref.value}</span>
                      <ChevronRight className="size-4 text-[#d5c0c6] group-hover:text-[#7a1f39]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Matters */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbeaf0] to-[#f4dbe2] p-6 shadow-sm border border-[#f0dfe3]">
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-6 text-[#7a1f39]" />
                  <h3 className="text-base font-bold text-[#2d111b]">Your Safety Matters</h3>
                </div>
                <p className="mt-2 text-sm text-[#6a4953] leading-relaxed">
                  We're committed to providing a safe and trusted experience for all our users.
                </p>
                <button className="mt-4 flex items-center gap-1 text-sm font-bold text-[#7a1f39]">
                  Learn More <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
