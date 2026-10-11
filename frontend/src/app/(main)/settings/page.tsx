"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Star,
  Bell,
  CreditCard,
  Globe,
  Palette,
  HelpCircle,
  Info,
  Camera,
  BadgeCheck,
  Check,
  Pencil,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  KeyRound,
  Zap,
  Eye,
  Headphones,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  initialUserProfile,
  initialQuickSettings,
  settingsNavLinks,
  type QuickSettings,
  type UserProfile,
} from "@/config/settings-data";
import { CompanionSettings } from "./companion-settings";
import { CoFounderSettings } from "./cofounder-settings";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { PhoneVerification } from "@/components/verification/phone-verification";

/**
 * Toggle Switch Component
 * Accessible switch matching the Figma burgundy active state and soft pill look.
 */
function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-berry/30",
        checked ? "bg-berry" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "account";
  
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Keep tab in sync when navigating client-side to /settings?tab=xxx
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const tabListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab pill into view on mobile
  useEffect(() => {
    const activeEl = tabListRef.current?.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [quickSettings, setQuickSettings] = useState<QuickSettings>(initialQuickSettings);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUserProfile({
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        city: user.city || "",
        avatar: user.avatarUrl || null,
        bio: user.bio || "",
        interests: user.interests || [],
        languages: user.languages || [],
        isVerified: !!user.isVerified,
      });
    }
  }, [user]);

  const toggleQuickSetting = (key: keyof QuickSettings) => {
    setQuickSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startEditing = (field: keyof UserProfile, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveFieldEdit = async (field: keyof UserProfile, overrideValue?: any) => {
    if (!user || isSaving) return;
    
    setIsSaving(true);
    const finalValue = overrideValue !== undefined ? overrideValue : editValue;
    
    try {
      // Build patch payload based on field
      const payload: Record<string, any> = {};
      
      if (field === "name") payload.fullName = finalValue;
      else if (field === "dateOfBirth") payload.dateOfBirth = finalValue ? new Date(finalValue).toISOString() : null;
      else payload[field] = finalValue;
      
      const response = await apiFetch<{ success: boolean; data: any }>("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.success) {
        setUserProfile((prev) => ({
          ...prev,
          [field]: finalValue,
        }));
        setEditingField(null);
        await refreshUser?.();
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getNavIcon = (iconName: string) => {
    switch (iconName) {
      case "user":
        return User;
      case "star":
        return Star;
      case "lock":
        return Lock;
      case "bell":
        return Bell;
      case "credit-card":
        return CreditCard;
      case "globe":
        return Globe;
      case "palette":
        return Palette;
      case "help-circle":
        return HelpCircle;
      case "info":
        return Info;
      case "briefcase":
        return Briefcase;
      default:
        return SettingsIcon;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 min-w-0 overflow-x-hidden">
      {/* ═══ TOP HEADER BANNER ═══ */}
      <section className="relative overflow-hidden rounded-2xl border border-soft-border bg-gradient-to-r from-[#faecef] via-[#f7e6ea] to-[#f4dde2] p-5 sm:p-6 shadow-sm">
        {/* Soft background floral accent */}
        <div
          className="pointer-events-none absolute -right-6 -top-10 size-48 opacity-10 bg-contain bg-no-repeat"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-berry/10 text-berry shadow-inner">
              <SettingsIcon className="size-6 text-berry" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-foreground sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage your account, preferences and experience.
              </p>
            </div>
          </div>

          {/* Right decorative pill and script */}
          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
            <div className="text-right">
              <p className="font-serif text-xs sm:text-sm italic text-berry leading-tight">
                Your Privacy
                <br />
                Our Priority ♡
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/70 border border-soft-border/80 shadow-xs">
              <ShieldCheck className="size-5 text-berry" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE / TABLET HORIZONTAL TABS (sticky pill strip) ═══ */}
      <div className="sticky top-14 sm:top-16 z-20 -mx-4 mt-4 bg-white/95 px-4 py-3 backdrop-blur-md border-y border-soft-border/70 lg:hidden shadow-xs w-[calc(100%+2rem)] max-w-[calc(100%+2rem)] overflow-hidden">
        <div
          ref={tabListRef}
          className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden w-full min-w-0"
        >
          <div className="flex items-center gap-2 w-max">
            {settingsNavLinks.map((nav) => {
              const Icon = getNavIcon(nav.icon);
              const isActive = activeTab === nav.id;

              return (
                <button
                  key={nav.id}
                  data-tab={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  type="button"
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95",
                    isActive
                      ? "bg-deep-plum text-white shadow-sm ring-1 ring-deep-plum"
                      : "border border-soft-border bg-white text-muted-foreground hover:bg-[#faecef]/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-4", isActive ? "text-dusty-rose" : "text-berry")} />
                  <span>{nav.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ 3-COLUMN MAIN LAYOUT ═══ */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ─── COLUMN 1: Settings Navigation Menu (Desktop 3 cols) ─── */}
        <nav
          aria-label="Settings navigation"
          className="hidden lg:flex lg:col-span-3 flex-col gap-1.5"
        >
          {settingsNavLinks.map((nav) => {
            const Icon = getNavIcon(nav.icon);
            const isActive = activeTab === nav.id;

            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                type="button"
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                  isActive
                    ? "bg-[#faecef] text-deep-plum font-semibold border-l-4 border-berry shadow-xs"
                    : "bg-white text-muted-foreground hover:bg-[#fcf5f6] hover:text-foreground border border-soft-border/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-berry/15 text-berry"
                        : "bg-muted/60 text-muted-foreground group-hover:text-berry"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm">{nav.label}</span>
                </div>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    isActive ? "text-berry" : "text-muted-foreground/40 group-hover:text-berry/70"
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* ─── COLUMN 2: Account Settings Content (6 cols) ─── */}
        {activeTab === "account" && (
          <main className="lg:col-span-6 space-y-6">
            {/* Header Subtitle Card */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Account Settings
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Update your personal information and account details.
              </p>
            </div>
          </div>

          {/* Profile Overview Card */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar with Camera upload */}
                <AvatarUpload
                  currentAvatar={userProfile.avatar}
                  userName={userProfile.name}
                  onAvatarUpdated={(newUrl) => {
                    setUserProfile((prev) => ({ ...prev, avatar: newUrl }));
                  }}
                  size="md"
                />

                {/* Name & Contact Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {userProfile.name}
                    </h3>
                    {userProfile.isVerified && (
                      <BadgeCheck className="size-4 text-sky-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.phone}
                  </p>

                  {userProfile.isVerified ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <Check className="size-3.5 text-emerald-600 stroke-[3]" />
                      Verified Account
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                      <ShieldCheck className="size-3.5 text-amber-600" />
                      Verify your phone to get the badge
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Profile CTA */}
              <div className="sm:self-start">
                <Button
                  variant="outline"
                  onClick={() => startEditing("name", userProfile.name)}
                  className="h-10 rounded-xl border-soft-border text-sm font-semibold text-foreground hover:border-berry hover:text-berry gap-1.5"
                >
                  <Pencil className="size-3.5 text-berry" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </section>

          {/* Personal Information Card */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-soft-border pb-3.5">
              <User className="size-4.5 text-berry" />
              <h3 className="text-base font-bold text-foreground">
                Personal Information
              </h3>
            </div>

            <div className="divide-y divide-soft-border/70">
              {/* Full Name */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <User className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Full Name
                    </span>
                    {editingField === "name" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("name")}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.name}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "name" && (
                  <button
                    onClick={() => startEditing("name", userProfile.name)}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Email Address */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Email Address
                    </span>
                    {editingField === "email" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("email")}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.email}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "email" && (
                  <button
                    onClick={() => startEditing("email", userProfile.email)}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Phone Number — changes go through OTP verification */}
              <PhoneVerification
                phone={user?.phone}
                isPhoneVerified={!!user?.isPhoneVerified}
                onVerified={() => refreshUser()}
              />

              {/* Gender */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <User className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Gender
                    </span>
                    {editingField === "gender" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <button
                          onClick={() => saveFieldEdit("gender")}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.gender}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "gender" && (
                  <button
                    onClick={() => startEditing("gender", userProfile.gender)}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Calendar className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Date of Birth
                    </span>
                    {editingField === "dateOfBirth" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("dateOfBirth")}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.dateOfBirth}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "dateOfBirth" && (
                  <button
                    onClick={() => startEditing("dateOfBirth", userProfile.dateOfBirth)}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      City
                    </span>
                    {editingField === "city" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-9 rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("city")}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.city || "Not set"}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "city" && (
                  <button
                    onClick={() => startEditing("city", userProfile.city || "")}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>
              
              {/* Bio */}
              <div className="flex items-start justify-between gap-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <User className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Bio
                    </span>
                    {editingField === "bio" ? (
                      <div className="mt-1 flex flex-col gap-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-24 w-full min-w-[250px] sm:min-w-[320px] rounded-lg border border-berry p-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("bio")}
                          className="self-start rounded-lg bg-berry px-4 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="mt-1 max-w-sm text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.bio || "Not set"}
                      </p>
                    )}
                  </div>
                </div>
                {editingField !== "bio" && (
                  <button
                    onClick={() => startEditing("bio", userProfile.bio || "")}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Languages */}
              <div className="flex items-start justify-between gap-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Globe className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Languages (comma-separated)
                    </span>
                    {editingField === "languages" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="English, Bengali, Hindi"
                          className="h-9 w-full min-w-[220px] rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const langs = editValue
                              .split(",")
                              .map((l) => l.trim())
                              .filter(Boolean);
                            saveFieldEdit("languages", langs);
                          }}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.languages?.length > 0 ? userProfile.languages.join(", ") : "Not set"}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "languages" && (
                  <button
                    onClick={() => startEditing("languages", userProfile.languages?.join(", ") || "")}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Interests */}
              <div className="flex items-start justify-between gap-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Heart className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                      Interests (comma-separated)
                    </span>
                    {editingField === "interests" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Music, Travel, Food"
                          className="h-9 w-full min-w-[220px] rounded-lg border border-berry px-3 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const ints = editValue
                              .split(",")
                              .map((i) => i.trim())
                              .filter(Boolean);
                            saveFieldEdit("interests", ints);
                          }}
                          className="rounded-lg bg-berry px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        {userProfile.interests?.length > 0 ? userProfile.interests.join(", ") : "Not set"}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "interests" && (
                  <button
                    onClick={() => startEditing("interests", userProfile.interests?.join(", ") || "")}
                    className="flex items-center gap-1.5 rounded-lg border border-soft-border px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:border-berry hover:text-berry transition-colors cursor-pointer"
                  >
                    <Pencil className="size-3.5 text-berry" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Change Password Card */}
          <section className="flex flex-col gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-berry/8 text-berry">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Change Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep your account safe with a strong password.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-10 shrink-0 rounded-xl border-soft-border bg-[#faecef]/60 hover:bg-[#faecef] text-berry font-semibold text-sm gap-1.5 cursor-pointer"
            >
              <KeyRound className="size-4 text-berry" />
              Change Password
            </Button>
          </section>
          </main>
        )}

        {activeTab === "companion" && <CompanionSettings />}
        {activeTab === "cofounder" && <CoFounderSettings />}

        {activeTab !== "account" && activeTab !== "companion" && activeTab !== "cofounder" && (
          <main className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
                <SettingsIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  {settingsNavLinks.find((t) => t.id === activeTab)?.label ?? "Settings"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Preferences and configurations for {settingsNavLinks.find((t) => t.id === activeTab)?.label.toLowerCase() ?? "this section"}.
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-soft-border bg-white p-6 sm:p-8 shadow-xs text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Settings and controls for {settingsNavLinks.find((t) => t.id === activeTab)?.label} are coming soon.
              </p>
            </section>
          </main>
        )}
        {/* ─── COLUMN 3: Quick Settings & Safety (3 cols) ─── */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Quick Settings Card */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="size-4.5 text-berry" />
              Quick Settings
            </h3>

            <div className="mt-5 space-y-5">
              {/* Two-Factor Authentication */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <ShieldCheck className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-normal mt-0.5">
                      Add extra layer of security to your account.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quickSettings.twoFactorAuth}
                  onCheckedChange={() => toggleQuickSetting("twoFactorAuth")}
                  ariaLabel="Toggle two-factor authentication"
                />
              </div>

              {/* Login Alerts */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Bell className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      Login Alerts
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-normal mt-0.5">
                      Get notified about new logins.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quickSettings.loginAlerts}
                  onCheckedChange={() => toggleQuickSetting("loginAlerts")}
                  ariaLabel="Toggle login alerts"
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-normal mt-0.5">
                      Receive important updates via email.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quickSettings.emailNotifications}
                  onCheckedChange={() => toggleQuickSetting("emailNotifications")}
                  ariaLabel="Toggle email notifications"
                />
              </div>

              {/* Activity Visibility */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Eye className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      Activity Visibility
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-normal mt-0.5">
                      Control who can see your activity.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quickSettings.activityVisibility}
                  onCheckedChange={() => toggleQuickSetting("activityVisibility")}
                  ariaLabel="Toggle activity visibility"
                />
              </div>
            </div>
          </div>

          {/* Need Help? Card */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Headphones className="size-4.5 text-berry" />
              <h3 className="text-base font-bold text-foreground">Need Help?</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Our support team is available 24/7.
            </p>
            <Link
              href="/support"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-soft-border bg-white text-sm font-semibold text-foreground hover:border-berry hover:text-berry hover:bg-berry/5 transition-colors"
            >
              Contact Support <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Your Safety Matters Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#ecd2d8] bg-gradient-to-br from-[#fcf3f5] via-[#faecef] to-[#f7e6ea] p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#ecd2d8] shadow-xs">
                <ShieldCheck className="size-5.5 text-berry" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Your Safety Matters
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  We are committed to providing a safe and trusted experience for all our users.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/safety"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#ecd2d8] bg-white px-4 text-xs sm:text-sm font-semibold text-berry hover:bg-berry hover:text-white transition-colors shadow-2xs"
              >
                Learn More <ArrowRight className="size-3.5" />
              </Link>

              {/* Decorative script */}
              <div className="text-right">
                <p className="font-serif text-xs italic text-berry/80 leading-tight">
                  Safer People
                  <br />
                  Happier Stories ♡
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin size-8 border-4 border-berry border-t-transparent rounded-full" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
