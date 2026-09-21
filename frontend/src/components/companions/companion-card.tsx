"use client";

import Link from "next/link";
import { Heart, MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { Companion } from "@/config/companions-data";

/**
 * Companion profile card — reusable across all explore pages.
 *
 * Backend-ready: accepts a `Companion` object.
 * When real images are available, replace the gradient placeholder
 * with `<Image src={companion.avatar} />`.
 */
export function CompanionCard({ companion }: { companion: Companion }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-soft-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="relative h-52 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            "from-berry-dark/80 via-berry/60 to-dusty-rose/40"
          )}
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:bg-black/0" />

        {/* Verified badge */}
        {companion.isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <BadgeCheck className="size-3" />
            Verified
          </span>
        )}

        {/* Favorite */}
        <button
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-berry"
          aria-label={`Save ${companion.name}`}
        >
          <Heart className="size-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground">{companion.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {companion.age} · {companion.profession}
        </p>
        <p className="mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
          <MapPin className="size-3 text-berry" />
          {companion.city}
        </p>

        {/* Interest tags */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {companion.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="rounded-md border border-soft-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {interest}
            </span>
          ))}
          {companion.interests.length > 3 && (
            <span className="rounded-md border border-soft-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{companion.interests.length - 3} more
            </span>
          )}
        </div>

        {/* Price */}
        <p className="mt-3 text-lg font-bold text-berry">
          ₹{companion.pricePerHour.toLocaleString("en-IN")}
          <span className="text-xs font-normal text-muted-foreground"> / hour</span>
        </p>

        {/* CTA */}
        <Button
          className="mt-3 h-9 w-full rounded-xl bg-berry hover:bg-berry-dark text-white text-xs font-semibold"
        >
          <Link href={`/companion/${companion.id}`} className="flex items-center gap-1">
            View Profile <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
