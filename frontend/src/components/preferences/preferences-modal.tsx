"use client";

import { useState, useEffect } from "react";
import {
  X,
  Heart,
  Compass,
  Check,
  Loader2,
  Coffee,
  Camera,
  MapPin,
  Sparkles,
  MessageCircle,
  Briefcase,
  BookOpen,
  Dumbbell,
  Film,
  ShoppingBag,
  Users,
  Calendar,
  Languages,
} from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

export const LOOKING_FOR_OPTIONS = [
  { id: "Food & Cafe Experiences", label: "Food & Cafe Experiences", icon: Coffee },
  { id: "Photography Walks", label: "Photography Walks", icon: Camera },
  { id: "City Exploration", label: "City Exploration", icon: Compass },
  { id: "Festivals & Cultural Events", label: "Festivals & Cultural Events", icon: Sparkles },
  { id: "Friendly Conversations", label: "Friendly Conversations", icon: MessageCircle },
  { id: "Startup & Networking Chats", label: "Startup & Networking Chats", icon: Briefcase },
  { id: "Study & Co-working Buddy", label: "Study & Co-working Buddy", icon: BookOpen },
  { id: "Fitness & Outdoor Walks", label: "Fitness & Outdoor Walks", icon: Dumbbell },
  { id: "Movies & Entertainment", label: "Movies & Entertainment", icon: Film },
  { id: "Shopping & Street Markets", label: "Shopping & Street Markets", icon: ShoppingBag },
] as const;

export const GENDER_PREFERENCE_OPTIONS = [
  "Female",
  "Male",
  "Non-Binary",
  "Open to All",
] as const;

export const LANGUAGE_OPTIONS = ["English", "Hindi", "Bengali", "Other"] as const;

export const LOCATION_PRESETS = [
  "Kolkata (Within 10 km)",
  "Kolkata (Within 20 km)",
  "Kolkata (City-wide)",
  "Flexible / Remote",
] as const;

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PreferencesModal({ isOpen, onClose, onSuccess }: PreferencesModalProps) {
  const { user, refreshUser } = useAuth();

  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [preferredGender, setPreferredGender] = useState<string>("Female");
  const [preferredAgeMin, setPreferredAgeMin] = useState<number>(18);
  const [preferredAgeMax, setPreferredAgeMax] = useState<number>(35);
  const [preferredLocation, setPreferredLocation] = useState<string>("Kolkata (Within 20 km)");
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(["English", "Hindi"]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with current user preferences when opening modal
  useEffect(() => {
    if (isOpen && user) {
      setLookingFor(user.lookingFor && user.lookingFor.length > 0 ? user.lookingFor : [
        "Food & Cafe Experiences",
        "Photography Walks",
        "City Exploration",
        "Festivals & Cultural Events",
        "Friendly Conversations"
      ]);
      setPreferredGender(user.preferredGender || "Female");
      setPreferredAgeMin(user.preferredAgeMin ?? 18);
      setPreferredAgeMax(user.preferredAgeMax ?? 35);
      setPreferredLocation(user.preferredLocation || "Kolkata (Within 20 km)");
      setPreferredLanguages(
        user.preferredLanguages && user.preferredLanguages.length > 0
          ? user.preferredLanguages
          : ["Hindi", "English"]
      );
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleLookingFor = (optionId: string) => {
    setLookingFor((prev) =>
      prev.includes(optionId) ? prev.filter((item) => item !== optionId) : [...prev, optionId]
    );
  };

  const toggleLanguage = (lang: string) => {
    setPreferredLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookingFor,
          preferredGender,
          preferredAgeMin: Number(preferredAgeMin),
          preferredAgeMax: Number(preferredAgeMax),
          preferredLocation,
          preferredLanguages,
        }),
      });

      await refreshUser();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Preferences & Interests"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-3xl border border-soft-border bg-white p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-soft-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-berry/10 text-berry">
              <Heart className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Your Interests &amp; Preferences
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Personalize what you are looking for and your companion preferences.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs sm:text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: What I'm Looking For */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Compass className="size-4 text-berry" />
                <span>What I&apos;m Looking For</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {lookingFor.length} selected
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the experiences, outings, or connection types you want to explore:
            </p>

            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR_OPTIONS.map((item) => {
                const isSelected = lookingFor.includes(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleLookingFor(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer",
                      isSelected
                        ? "border-berry bg-berry text-white shadow-xs ring-1 ring-berry"
                        : "border-soft-border bg-[#fbf5f6] text-[#4d2832] hover:bg-[#faecef]"
                    )}
                  >
                    <Icon className={cn("size-3.5", isSelected ? "text-white" : "text-berry")} />
                    <span>{item.label}</span>
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-soft-border" />

          {/* Section 2: Partner / Companion Match Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="size-4 text-berry" />
              <span>Matching Preferences</span>
            </h3>

            {/* Gender Preference */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Gender Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENDER_PREFERENCE_OPTIONS.map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setPreferredGender(gender)}
                    className={cn(
                      "rounded-xl border py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                      preferredGender === gender
                        ? "border-berry bg-berry/10 text-berry ring-1 ring-berry"
                        : "border-soft-border bg-white text-muted-foreground hover:bg-[#fbf5f6]"
                    )}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Age Range (Min – Max years)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-soft-border bg-white px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">Min:</span>
                  <input
                    type="number"
                    min={18}
                    max={preferredAgeMax}
                    value={preferredAgeMin}
                    onChange={(e) => setPreferredAgeMin(Number(e.target.value))}
                    className="w-full text-sm font-bold text-foreground focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground">yrs</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-soft-border bg-white px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">Max:</span>
                  <input
                    type="number"
                    min={preferredAgeMin}
                    max={100}
                    value={preferredAgeMax}
                    onChange={(e) => setPreferredAgeMax(Number(e.target.value))}
                    className="w-full text-sm font-bold text-foreground focus:outline-none"
                  />
                  <span className="text-xs text-muted-foreground">yrs</span>
                </div>
              </div>
            </div>

            {/* Location Preference */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Location Preference
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPreferredLocation(preset)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                      preferredLocation === preset
                        ? "border-berry bg-berry/10 text-berry font-bold"
                        : "border-soft-border bg-[#fbf5f6] text-muted-foreground hover:bg-[#faecef]"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Kolkata (Within 25 km)"
                className="w-full rounded-xl border border-soft-border bg-white px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-berry"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Preferred Communication Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = preferredLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                        isSelected
                          ? "border-berry bg-berry text-white font-bold"
                          : "border-soft-border bg-[#fbf5f6] text-muted-foreground hover:bg-[#faecef]"
                      )}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-soft-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border-soft-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-berry text-white hover:bg-berry/90 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
