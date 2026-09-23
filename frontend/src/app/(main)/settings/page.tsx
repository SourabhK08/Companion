"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  User,
  Lock,
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
  KeyRound,
  Zap,
  Eye,
  Headphones,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("account");
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [quickSettings, setQuickSettings] = useState<QuickSettings>(initialQuickSettings);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const toggleQuickSetting = (key: keyof QuickSettings) => {
    // Ready for PATCH /api/users/me/settings
    setQuickSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startEditing = (field: keyof UserProfile, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveFieldEdit = (field: keyof UserProfile) => {
    // Ready for PATCH /api/users/me
    setUserProfile((prev) => ({
      ...prev,
      [field]: editValue,
    }));
    setEditingField(null);
  };

  const getNavIcon = (iconName: string) => {
    switch (iconName) {
      case "user":
        return User;
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
      default:
        return SettingsIcon;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
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
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
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

      {/* ═══ 3-COLUMN MAIN LAYOUT ═══ */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ─── COLUMN 1: Settings Navigation Menu (3 cols) ─── */}
        <nav
          aria-label="Settings navigation"
          className="lg:col-span-3 flex flex-col gap-1.5"
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
                  <span className="text-xs sm:text-sm">{nav.label}</span>
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
        <main className="lg:col-span-6 space-y-6">
          {/* Header Subtitle Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-berry/10 text-berry">
              <User className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Account Settings
              </h2>
              <p className="text-xs text-muted-foreground">
                Update your personal information and account details.
              </p>
            </div>
          </div>

          {/* Profile Overview Card */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar with Camera badge */}
                <div className="relative size-16 shrink-0">
                  <div className="size-16 overflow-hidden rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-dusty-rose to-berry flex items-center justify-center text-white text-lg font-bold">
                    {userProfile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userProfile.avatar}
                        alt={userProfile.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{userProfile.name.split(" ").map((n) => n[0]).join("")}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Upload photo"
                    className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-berry text-white shadow-md hover:bg-berry-dark transition-colors"
                  >
                    <Camera className="size-3" />
                  </button>
                </div>

                {/* Name & Contact Info */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-foreground">
                      {userProfile.name}
                    </h3>
                    {userProfile.isVerified && (
                      <BadgeCheck className="size-4 text-sky-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userProfile.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile.phone}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    <Check className="size-3 text-emerald-600 stroke-[3]" />
                    Verified Account
                  </div>
                </div>
              </div>

              {/* Edit Profile CTA */}
              <div className="sm:self-start">
                <Button
                  variant="outline"
                  onClick={() => startEditing("name", userProfile.name)}
                  className="h-9 rounded-xl border-soft-border text-xs font-semibold text-foreground hover:border-berry hover:text-berry gap-1.5"
                >
                  <Pencil className="size-3 text-berry" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </section>

          {/* Personal Information Card */}
          <section className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-soft-border pb-3">
              <User className="size-4 text-berry" />
              <h3 className="text-sm font-bold text-foreground">
                Personal Information
              </h3>
            </div>

            <div className="divide-y divide-soft-border/70">
              {/* Full Name */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Full Name
                    </span>
                    {editingField === "name" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("name")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.name}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "name" && (
                  <button
                    onClick={() => startEditing("name", userProfile.name)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Email Address */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Email Address
                    </span>
                    {editingField === "email" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("email")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.email}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "email" && (
                  <button
                    onClick={() => startEditing("email", userProfile.email)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Phone Number
                    </span>
                    {editingField === "phone" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("phone")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.phone}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "phone" && (
                  <button
                    onClick={() => startEditing("phone", userProfile.phone)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Gender */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Gender
                    </span>
                    {editingField === "gender" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <button
                          onClick={() => saveFieldEdit("gender")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.gender}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "gender" && (
                  <button
                    onClick={() => startEditing("gender", userProfile.gender)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Date of Birth
                    </span>
                    {editingField === "dateOfBirth" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("dateOfBirth")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.dateOfBirth}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "dateOfBirth" && (
                  <button
                    onClick={() => startEditing("dateOfBirth", userProfile.dateOfBirth)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Location
                    </span>
                    {editingField === "location" ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 rounded-lg border border-berry px-2 text-xs text-foreground focus:outline-none"
                        />
                        <button
                          onClick={() => saveFieldEdit("location")}
                          className="rounded-lg bg-berry px-2 py-1 text-[10px] font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        {userProfile.location}
                      </span>
                    )}
                  </div>
                </div>
                {editingField !== "location" && (
                  <button
                    onClick={() => startEditing("location", userProfile.location)}
                    className="flex items-center gap-1 rounded-lg border border-soft-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-berry hover:text-berry transition-colors"
                  >
                    <Pencil className="size-3 text-berry" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Change Password Card */}
          <section className="flex flex-col gap-3 rounded-2xl border border-soft-border bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-berry/8 text-berry">
                <Lock className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Change Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Keep your account safe with a strong password.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-9 shrink-0 rounded-xl border-soft-border bg-[#faecef]/60 hover:bg-[#faecef] text-berry font-semibold text-xs gap-1.5"
            >
              <KeyRound className="size-3.5 text-berry" />
              Change Password
            </Button>
          </section>
        </main>

        {/* ─── COLUMN 3: Quick Settings & Safety (3 cols) ─── */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Quick Settings Card */}
          <div className="rounded-2xl border border-soft-border bg-white p-5 shadow-xs">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Zap className="size-4 text-berry" />
              Quick Settings
            </h3>

            <div className="mt-5 space-y-5">
              {/* Two-Factor Authentication */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
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
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Login Alerts
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
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
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
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
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-berry/5 text-berry">
                    <Eye className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Activity Visibility
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
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
              <Headphones className="size-4 text-berry" />
              <h3 className="text-sm font-bold text-foreground">Need Help?</h3>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Our support team is available 24/7.
            </p>
            <Link
              href="/support"
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-soft-border bg-white text-xs font-semibold text-foreground hover:border-berry hover:text-berry hover:bg-berry/5 transition-colors"
            >
              Contact Support <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Your Safety Matters Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#ecd2d8] bg-gradient-to-br from-[#fcf3f5] via-[#faecef] to-[#f7e6ea] p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#ecd2d8] shadow-xs">
                <ShieldCheck className="size-5 text-berry" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Your Safety Matters
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  We are committed to providing a safe and trusted experience for all our users.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/safety"
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-[#ecd2d8] bg-white px-3.5 text-xs font-semibold text-berry hover:bg-berry hover:text-white transition-colors shadow-2xs"
              >
                Learn More <ArrowRight className="size-3" />
              </Link>

              {/* Decorative script */}
              <div className="text-right">
                <p className="font-serif text-[11px] italic text-berry/80 leading-tight">
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
