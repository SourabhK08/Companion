"use client";

import Link from "next/link";
import { Heart, MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { Companion } from "@/config/companions-data";

import { useSavedCompanions } from "@/hooks/use-saved-companions";

/**
 * Companion profile card — reusable across all explore pages.
 *
 * Backend-ready: accepts a `Companion` object.
 * When real images are available, replace the gradient placeholder
 * with `<Image src={companion.avatar} />`.
 */
export function CompanionCard({ companion }: { companion: Companion }) {
  const { isSaved, toggleSaved } = useSavedCompanions();
  const saved = isSaved(companion.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-[22px] border border-soft-border bg-white shadow-[0_4px_16px_rgba(122,31,57,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(122,31,57,0.12)] hover:-translate-y-0.5 w-full max-w-[420px] mx-auto sm:max-w-none">
      {/* Image / Avatar */}
      <div className="relative h-60 sm:h-56 overflow-hidden bg-gradient-to-br from-berry-dark/80 via-berry/60 to-dusty-rose/40">
        {companion.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={companion.avatar}
            alt={companion.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-bold text-white/60">
            {companion.name
              .split(" ")
              .map((n) => n[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* Verified badge */}
        {companion.isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <BadgeCheck className="size-4" />
            Verified
          </span>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(companion.id);
          }}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/85 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-berry cursor-pointer"
          aria-label={`Save ${companion.name}`}
        >
          <Heart className="size-4.5" fill={saved ? "currentColor" : "none"} color={saved ? "#7a1f39" : "currentColor"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground leading-snug">{companion.name}</h3>
            <span className="rounded-full border border-soft-border bg-warm-white px-2.5 py-1 text-xs font-semibold text-berry">
              {companion.city}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {companion.age} yrs · {companion.profession}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 text-berry shrink-0" />
            <span>{companion.city}</span>
            <span>•</span>
            <span className="truncate">{companion.languages.join(", ")}</span>
          </p>

          {/* Interest tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {companion.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {interest}
              </span>
            ))}
            {companion.interests.length > 3 && (
              <span className="rounded-md border border-soft-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{companion.interests.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-soft-border/60">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-berry">
              ₹{companion.pricePerHour.toLocaleString("en-IN")}
              <span className="text-sm font-normal text-muted-foreground"> / hour</span>
            </p>
          </div>

          {/* CTA */}
          <Link
            href={`/companion/${companion.id}`}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-berry text-sm font-semibold text-white shadow-sm transition-colors hover:bg-berry-dark cursor-pointer active:scale-[0.99]"
          >
            View Profile <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
