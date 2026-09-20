import {
  ShieldCheck,
  Lock,
  Star,
  Users,
  CheckCircle,
  Heart,
  UserPlus,
} from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { signupTrustIndicators, trustBadges } from "@/config/site";

/** Map trust indicator icon names to Lucide components. */
const trustIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "shield-check": ShieldCheck,
  lock: Lock,
  star: Star,
  users: Users,
  "check-circle": CheckCircle,
  heart: Heart,
};

/**
 * Sign Up page matching the Companionly reference design.
 *
 * Layout:
 *   Desktop — Split: left hero (55%) + right signup form (45%)
 *   Mobile  — Stacked: condensed hero + signup form
 *
 * Hero differences from login:
 *   - "JOIN COMPANIONLY" eyebrow (instead of "WELCOME BACK")
 *   - "Start Your Companion Journey With Us" heading
 *   - Description about creating account
 *   - Trust indicators in 2×2 grid
 *   - Script tagline: "More People. More Experiences. More Meaningful Moments."
 *   - Bottom trust badge bar
 */
export default function SignupPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
      {/* ═══ LEFT: Hero Section ═══ */}
      <section
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[#2b0d29] px-5 py-5 sm:px-8 lg:w-[55%] lg:px-12 lg:py-6 xl:px-16"
        aria-label="Welcome section"
      >
        {/* Background gradient placeholder */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 22%), radial-gradient(circle at 75% 30%, rgba(245,182,201,0.24), transparent 18%), linear-gradient(135deg, var(--color-deep-plum) 0%, var(--color-berry-dark) 35%, var(--color-berry) 68%, var(--color-dusty-rose) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(28,9,22,0.92) 0%, rgba(28,9,22,0.68) 35%, rgba(28,9,22,0.18) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep-plum to-transparent"
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-[620px] flex-1 flex flex-col justify-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 text-[#f2c8d9]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
              Join Companionly
            </span>
            <span className="h-px w-10 bg-[#f2c8d9]/60" aria-hidden="true" />
          </div>

          {/* Main heading */}
          <h1 className="mt-4 max-w-[500px] text-4xl font-bold leading-[0.95] text-white sm:text-5xl lg:text-[3.35rem] xl:text-[4rem]">
            Start Your
            <br />
            <span className="italic text-[#f2c8d9]">Companion Journey</span>
            <br />
            With Us
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
            Create your Companionly account and discover verified people,
            meaningful experiences and trusted companionship – all in one place.
          </p>

          {/* Trust indicators — 2×2 grid */}
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

          {/* Decorative tagline */}
          <p
            className="mt-8 font-serif text-lg italic text-[#f0d3df]/70 sm:mt-10 sm:text-xl"
            aria-hidden="true"
          >
            More People. More Experiences.
            <br />
            More Meaningful Moments. ♡
          </p>
        </div>

        {/* ─── Bottom Trust Badge Bar ─── */}
        <div className="relative z-10 mt-6">
          <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              {/* Main badge */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <UserPlus className="size-5 text-[#f2c8d9]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Trusted Companionship
                  </p>
                  <p className="text-[11px] leading-snug text-white/55">
                    Built around verified people, meaningful plans
                    <br className="hidden sm:block" /> and safer real-world
                    experiences.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden h-10 w-px bg-white/15 sm:block" aria-hidden="true" />

              {/* Badge items */}
              <div className="flex items-center gap-6 sm:gap-8">
                {trustBadges.map((badge) => {
                  const Icon = trustIconMap[badge.icon];
                  return (
                    <div key={badge.label} className="flex flex-col items-center gap-1.5 text-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RIGHT: Signup Form ═══ */}
      <section
        className="flex flex-1 items-start justify-center overflow-y-auto bg-warm-white px-4 py-6 sm:px-6 lg:w-[45%] lg:items-start lg:px-8 lg:py-8 xl:px-12"
        aria-label="Sign up form"
      >
        <div className="w-full max-w-[480px] rounded-[30px] bg-white/80 p-4 shadow-[0_20px_55px_rgba(54,18,44,0.12)] ring-1 ring-soft-border backdrop-blur-sm sm:p-6 lg:p-7">
          <SignupForm />
        </div>
      </section>
    </div>
  );
}
