"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Camera,
  Check,
  Clock3,
  Heart,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

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
  { label: "Languages", id: "languages" },
  { label: "Reviews", id: "reviews" },
] as const;

const tagStyles =
  "inline-flex items-center rounded-full border border-[#e8d7db] bg-[#f8f1f2] px-3 py-1.5 text-[12px] font-medium text-[#6b2d3e]";

const profileTags = [
  "Food Walk",
  "Photography",
  "Travel",
  "Cafe Hopping",
  "Art & Culture",
  "Music",
  "City Walks",
  "Cultural Events",
];

const remainingTags = profileTags.slice(4);

const highlightItems = [
  { title: "ID Verified", subtitle: "Government ID & Profile Verified", icon: ShieldCheck },
  { title: "Non-Smoker", subtitle: "Clean & Safe Lifestyle", icon: CigaretteOffIcon },
  { title: "Flexible Hours", subtitle: "Available Weekends & Evenings", icon: Clock3 },
  { title: "Public Meeting", subtitle: "Always in Public Locations", icon: Users },
];

const experienceTags = [
  "Food Walks",
  "Photography",
  "Cafe Hopping",
  "Travel",
  "Cultural Events",
  "Museum Tour",
  "City Exploration",
  "More",
];

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("about");
  const [showAllTags, setShowAllTags] = useState(false);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const scrollToSection = (id: (typeof tabs)[number]["id"]) => {
    setActiveTab(id);
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visibleTags = profileTags.slice(0, 4);
  const tagsToRender = showAllTags ? profileTags : visibleTags;

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
    <div className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:gap-5">
              <div className="relative shrink-0 overflow-hidden rounded-full border-4 border-white/80 bg-[#f8d5d2] shadow-[0_8px_18px_rgba(74,19,35,0.18)]">
                <div
                  className="h-28 w-28 bg-cover bg-center sm:h-30 sm:w-30 lg:h-32 lg:w-32"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80)",
                  }}
                />
              </div>

              <div className="pt-1 sm:pt-3">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-[#7a1f39] backdrop-blur-sm ring-1 ring-white/70">
                  <ShieldCheck className="size-3.5" />
                  Verified
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[#411522]">
                  <h1 className="font-serif text-[30px] font-bold leading-none sm:text-[38px] lg:text-[42px]">
                    Aanya Sharma
                  </h1>
                  <span className="mt-1 text-xl text-[#7a1f39]">♡</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#4f2b36] sm:gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-[#ffb84d] text-[#ffb84d]" />
                    4.9
                    <span className="text-[#714652]">(124 reviews)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-[#7a1f39]" />
                    Kolkata
                  </span>
                </div>

                <p className="mt-3 max-w-[620px] text-[14px] font-medium text-[#4e2834] sm:text-[16px]">
                  Good food, great conversations and beautiful experiences — that&apos;s what I love.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tagsToRender.map((tag) => (
                    <span key={tag} className={tagStyles}>{tag}</span>
                  ))}

                  {remainingTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTags((prev) => !prev)}
                      className="inline-flex items-center rounded-full bg-[#7a1f39] px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#66192d]"
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

        <div className="border-b border-[#eadfe2] bg-[#f5f0ee] px-3 py-3 sm:px-4 lg:px-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
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

              <p className="text-[15px] leading-7 text-[#4d2a35]">
                Hi! I&apos;m Aanya, a creative soul who loves exploring new places, trying local food,
                photography and meeting interesting people. I enjoy cultural events, art, and casual
                conversations. I&apos;m here to create meaningful and enjoyable experiences with like-minded
                people.
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
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">English, Hindi, Bengali</div>
                </div>

                <div className="rounded-xl border border-[#efdadf] bg-[#f4eaee] p-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#f9eaf0] text-[#7a1f39]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#673448]">Age</div>
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">24 years</div>
                </div>

                <div className="rounded-xl border border-[#efdadf] bg-[#f4eaee] p-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[#f9eaf0] text-[#7a1f39]">
                    <MapPin className="size-4" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#673448]">Location</div>
                  <div className="mt-1 text-[14px] font-medium text-[#37232a]">Kolkata</div>
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
                    <div className="mt-1 text-[11px] leading-5 text-[#624953]">{subtitle}</div>
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
                {experienceTags.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#f0dfe3] bg-white px-3 py-2 text-sm font-medium text-[#6b2d3e]"
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

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
          </div>

          <aside className="space-y-5">
            <section className="rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#5d2436]">
                  <Camera className="size-5" />
                  <h2 className="text-[20px] font-bold">Gallery</h2>
                </div>
                <button type="button" className="text-sm font-medium text-[#7a1f39]">
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                ].map((image, index) => (
                  <div key={image + index} className="overflow-hidden rounded-[16px] border border-[#f0dfe3] bg-[#f2e9e9]">
                    <div className="h-28 w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#eadfe3] bg-[#f8f3f1] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-[#5d2436]">
                <Heart className="size-5 text-[#7a1f39]" />
                <h2 className="text-[20px] font-bold">What I&apos;m Looking For</h2>
              </div>

              <ul className="space-y-3 text-[15px] text-[#4d2832]">
                {[
                  "Food & Cafe Experiences",
                  "Photography Walks",
                  "City Exploration",
                  "Festivals & Cultural Events",
                  "Friendly Conversations",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#f8e4ea] text-[#7a1f39]">
                      <Check className="size-3.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

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
          </aside>
        </div>
      </div>
    </div>
  );
}
