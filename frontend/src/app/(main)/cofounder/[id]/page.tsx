"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, MapPin, MessageCircle, Lightbulb, Target, Languages, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useCoFounder, calculateAge } from "@/hooks/use-cofounders";
import { useStartCoFounderChat } from "@/hooks/use-start-cofounder-chat";
import { ChatPassModal } from "@/components/cofounders/chat-pass-modal";
import { LinkedinIcon } from "@/components/cofounders/linkedin-icon";

export default function CoFounderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { profile, isLoading, error } = useCoFounder(id);
  const chat = useStartCoFounderChat();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-berry" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{error ?? "Profile not found"}</p>
        <Link href="/explore/cofounder" className="text-sm font-semibold text-berry">← Back to Co-Founders</Link>
      </div>
    );
  }

  const u = profile.user;
  const age = calculateAge(u.dateOfBirth);
  const isSelf = user?.id === profile.userId;
  const initials = u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 lg:px-6">
      <Link href="/explore/cofounder" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-berry">
        <ArrowLeft className="size-4" /> Back to Co-Founders
      </Link>

      <div className="overflow-hidden rounded-[24px] border border-soft-border bg-white shadow-[0_12px_32px_rgba(122,31,57,0.08)]">
        <div className="h-32 bg-gradient-to-r from-deep-plum via-berry-dark to-berry" />
        <div className="-mt-14 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="size-28 overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-berry to-dusty-rose shadow">
              {u.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatar} alt={u.fullName} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-3xl font-bold text-white">{initials}</div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                {u.fullName}
                {age ? <span className="font-normal text-muted-foreground">, {age}</span> : null}
                {u.isVerified && <BadgeCheck className="size-5 text-berry" />}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 text-berry" /> {u.city ?? "Kolkata"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0a66c2]/30 px-4 text-sm font-semibold text-[#0a66c2] hover:bg-[#0a66c2]/5"
            >
              <LinkedinIcon className="size-4" /> View LinkedIn
            </a>
            {isSelf ? (
              <Link
                href="/settings?tab=cofounder"
                className="inline-flex h-11 items-center rounded-xl bg-deep-plum px-5 text-sm font-semibold text-white hover:bg-berry-dark"
              >
                Edit My Profile
              </Link>
            ) : (
              <button
                onClick={() => chat.startChat(profile.userId)}
                disabled={chat.isStarting}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-deep-plum px-5 text-sm font-semibold text-white hover:bg-berry-dark disabled:opacity-60"
              >
                {chat.isStarting ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
                Chat
              </button>
            )}
          </div>
        </div>

        {chat.error && (
          <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">{chat.error}</div>
        )}

        <div className="grid gap-5 border-t border-soft-border p-6 md:grid-cols-2">
          <section className="rounded-2xl bg-[#fbf4f5] p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Lightbulb className="size-4 text-berry" /> Idea / Pitch
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#5d2a38]">
              {profile.pitch || "No pitch shared yet."}
            </p>
          </section>
          <section className="rounded-2xl bg-[#fbf4f5] p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Target className="size-4 text-berry" /> Looking For
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#5d2a38]">
              {profile.lookingFor || "Open to discussing any collaboration."}
            </p>
          </section>
          <section className="md:col-span-2">
            <h2 className="text-sm font-bold text-foreground">Work Interests</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.workInterests.map((w) => (
                <span key={w} className="rounded-full bg-[#f5e8eb] px-3 py-1 text-xs font-medium text-[#5a2435]">{w}</span>
              ))}
            </div>
          </section>
          {u.bio && (
            <section className="md:col-span-2">
              <h2 className="text-sm font-bold text-foreground">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.bio}</p>
            </section>
          )}
          {u.languages.length > 0 && (
            <section className="md:col-span-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Languages className="size-4 text-berry" /> Languages
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{u.languages.join(", ")}</p>
            </section>
          )}
        </div>
      </div>

      <ChatPassModal
        open={chat.passModalOpen}
        onClose={chat.closePassModal}
        onSubscribe={chat.subscribe}
        onSuccess={chat.handlePassPurchased}
      />
    </div>
  );
}
