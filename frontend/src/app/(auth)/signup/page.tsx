import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Star,
  Users,
  CheckCircle,
  Heart,
  MapPin,
} from "lucide-react";

import { SignupForm } from "@/components/auth/signup-form";
import { signupTrustIndicators, trustBadges } from "@/config/site";

/** Map icon names → Lucide components */
const trustIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "shield-check": ShieldCheck,
  lock: Lock,
  star: Star,
  users: Users,
  "check-circle": CheckCircle,
  heart: Heart,
  "map-pin": MapPin,
};

/**
 * Sign Up page — Fully responsive for mobile and desktop.
 *
 * Mobile (< lg):
 *   - Scrollable container (min-h-[100dvh]) allowing complete scroll of all signup fields
 *   - Brand logo header
 *   - White signup card with comfortable mobile padding and crisp touch targets
 *
 * Desktop (>= lg):
 *   - Split screen: Left hero (55%) with trust indicators and badges
 *   - Right side (45%) with scrollable form area
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-deep-plum lg:h-screen lg:overflow-hidden flex flex-col">
      <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col flex-1">
        {/* Header */}
        <header className="relative z-30 shrink-0 px-4 py-3.5 sm:px-6 sm:py-5 lg:px-8 lg:pt-6">
          <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/10 shadow-[0_8px_25px_rgba(20,8,22,0.18)] backdrop-blur-sm">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-dusty-rose via-white/80 to-berry-dark" />
            </div>
            <div className="flex flex-col leading-none text-white/90">
              <span className="text-base sm:text-lg font-semibold tracking-tight">Modhuralap</span>
              <span className="mt-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/60">
                Companion
              </span>
            </div>
          </Link>
        </header>

        {/* Main */}
        <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* ═══ LEFT: Hero Section (Desktop only) ═══ */}
          <section
            className="relative hidden lg:flex flex-1 flex-col justify-between overflow-hidden bg-[#2b0d29] px-8 py-8 lg:w-[55%] lg:px-12 lg:py-10 xl:px-16"
            aria-label="Welcome section"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 22%), radial-gradient(circle at 75% 30%, rgba(245,182,201,0.24), transparent 18%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 35%, var(--color-berry) 68%, var(--color-dusty-rose) 100%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(28,9,22,0.92) 0%, rgba(28,9,22,0.68) 35%, rgba(28,9,22,0.18) 100%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep-plum to-transparent"
              aria-hidden="true"
            />

            <div className="relative z-10 flex w-full max-w-[620px] flex-1 flex-col justify-center">
              <div className="flex items-center gap-3 text-[#f2c8d9]">
                <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Join Modhuralap
                </span>
                <span className="h-px w-10 bg-[#f2c8d9]/60" aria-hidden="true" />
              </div>

              <h1 className="mt-4 max-w-[500px] text-4xl font-bold leading-[0.95] text-white sm:text-5xl lg:text-[3.35rem] xl:text-[4rem]">
                Start Your
                <br />
                <span className="italic text-[#f2c8d9]">Meaningful Journey</span>
                <br />
                With Us
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
                Meet like-minded people, share conversations, find your
                companions and create beautiful moments — in real life.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 sm:mt-10">
                {signupTrustIndicators.map((indicator) => {
                  const Icon = trustIconMap[indicator.icon];
                  return (
                    <div key={indicator.title} className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                        {Icon && <Icon className="size-4 text-[#f2c8d9]" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {indicator.title}
                        </p>
                        <p className="text-[11px] leading-snug text-white/55">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p
                className="mt-8 font-serif text-lg italic text-[#f0d3df]/70 sm:mt-10 sm:text-xl"
                aria-hidden="true"
              >
                More People. More Conversations.
                <br />
                A More Connected You. ♡
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-6 sm:gap-8">
                    {trustBadges.map((badge) => {
                      const Icon = trustIconMap[badge.icon];
                      return (
                        <div
                          key={badge.label}
                          className="flex flex-col items-center gap-1.5 text-center"
                        >
                          <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                            {Icon && <Icon className="size-4 text-[#f2c8d9]" />}
                          </div>
                          <span className="text-[10px] font-medium text-white/70 leading-tight">
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="font-serif text-sm italic text-[#f0d3df]/50 sm:text-base">
                    Same City. New Stories ♡
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ RIGHT: Sign Up Card (Mobile full scroll + Desktop inner scroll) ═══ */}
          <section
            className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:w-[45%] lg:px-8 lg:py-10 xl:px-12 bg-deep-plum lg:bg-warm-white"
            aria-label="Sign up form"
          >
            <div className="w-full max-w-[480px] rounded-2xl sm:rounded-[30px] bg-white p-5 sm:p-7 shadow-[0_20px_55px_rgba(54,18,44,0.18)] ring-1 ring-soft-border/80 my-auto">
              <SignupForm />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
