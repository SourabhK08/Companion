"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, MessageCircle, ArrowRight } from "lucide-react";
import { LinkedinIcon } from "./linkedin-icon";

import { calculateAge, type CoFounderProfile } from "@/hooks/use-cofounders";

interface CoFounderCardProps {
  profile: CoFounderProfile;
  isSelf?: boolean;
  onMessage: (userId: string) => void;
}

export function CoFounderCard({ profile, isSelf, onMessage }: CoFounderCardProps) {
  const { user } = profile;
  const age = calculateAge(user.dateOfBirth);
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-soft-border bg-white shadow-[0_8px_22px_rgba(122,31,57,0.06)] transition-shadow hover:shadow-[0_12px_28px_rgba(122,31,57,0.12)]">
      {/* Header strip */}
      <div className="relative h-10  bg-gradient-to-r/10 from-deep-plum via-berry-dark to-berry">
        {/* <a
          href={profile.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#0a66c2] hover:bg-white"
          aria-label={`${user.fullName}'s LinkedIn profile`}
        >
          <LinkedinIcon className="size-3" /> LinkedIn
        </a> */}
      </div>

      <div className="-mt-9 flex flex-1 flex-col px-4 pb-4">
        {/* Avatar */}
        <div className="size-[72px] overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-berry to-dusty-rose shadow-sm">
          {user.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.fullName} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-lg font-bold text-white">{initials}</div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <h3 className="truncate text-base font-bold text-foreground">
            {user.fullName}
            {age ? <span className="font-normal text-muted-foreground">, {age}</span> : null}
          </h3>
          {user.isVerified && <BadgeCheck className="size-4 shrink-0 text-berry" />}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 text-berry" /> {user.city ?? "Kolkata"}
        </p>

        {profile.pitch && (
          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-[#5d2a38]">“{profile.pitch}”</p>
        )}

        {profile.workInterests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.workInterests.slice(0, 4).map((w) => (
              <span key={w} className="rounded-full bg-[#f5e8eb] px-2 py-0.5 text-[10px] font-medium text-[#5a2435]">
                {w}
              </span>
            ))}
            {profile.workInterests.length > 4 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{profile.workInterests.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={`/cofounder/${profile.id}`}
            className="flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-soft-border text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            View <ArrowRight className="size-3.5" />
          </Link>
          {!isSelf && (
            <button
              onClick={() => onMessage(profile.userId)}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-deep-plum text-xs font-semibold text-white transition-colors hover:bg-berry-dark"
            >
              <MessageCircle className="size-3.5" /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
