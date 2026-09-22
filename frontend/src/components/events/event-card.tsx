"use client";

import Link from "next/link";
import { Heart, CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import type { Event } from "@/config/events-data";
import { categoryColors } from "@/config/events-data";

/**
 * Event card — reusable across all event listing pages.
 *
 * Backend-ready: accepts an `Event` object.
 * When real images are available, replace the gradient placeholder
 * with `<Image src={event.image} />`.
 */
export function EventCard({ event }: { event: Event }) {
  const colors = categoryColors[event.category] ?? {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-soft-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <div className="relative h-44 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            "from-berry-dark/70 via-berry/50 to-dusty-rose/30"
          )}
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:bg-black/0" />

        {/* Category badge */}
        <span
          className={cn(
            "absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm",
            colors.bg,
            colors.text
          )}
        >
          <span className="size-1.5 rounded-full bg-current opacity-60" />
          {event.category}
        </span>

        {/* Favorite */}
        <button
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-berry"
          aria-label={`Save ${event.title}`}
        >
          <Heart className="size-4" />
        </button>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 rounded-full bg-deep-plum/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          ₹{event.pricePerPerson.toLocaleString("en-IN")}{" "}
          <span className="font-normal text-white/70">/ person</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground leading-snug">{event.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{event.subtitle}</p>

        {/* Details */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0 text-berry" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0 text-berry" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-berry" />
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Attendees */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Avatar stack */}
            <div className="flex -space-x-1.5">
              {Array.from({ length: Math.min(4, event.attendeeAvatars) }).map((_, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border-2 border-white bg-gradient-to-br from-dusty-rose to-berry"
                />
              ))}
            </div>
            {event.attendeeAvatars > 4 && (
              <span className="text-[10px] font-medium text-berry">
                +{event.attendeeAvatars - 4}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {event.attendeesGoing} going
          </span>
        </div>

        {/* CTA */}
        <Button className="mt-3 h-9 w-full rounded-xl bg-berry hover:bg-berry-dark text-white text-xs font-semibold">
          <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-1"
          >
            View Details <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
