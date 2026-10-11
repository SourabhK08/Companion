import Link from "next/link";
import { ShieldCheck, Lock, Users } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { siteConfig, trustIndicators } from "@/config/site";

/** Map trust indicator icon names to Lucide components. */
const trustIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "shield-check": ShieldCheck,
  lock: Lock,
  users: Users,
};

/**
 * Login page — Fully responsive for mobile and desktop.
 *
 * Mobile (< lg):
 *   - Scrollable viewport (min-h-[100dvh]) so virtual keyboard never breaks layout
 *   - Clean header with Modhuralap logo
 *   - Centered login card with comfortable padding and high-contrast styling
 *
 * Desktop (>= lg):
 *   - Split layout: Left hero banner (55%) with brand graphics & trust badges
 *   - Right side (45%) with warm-white backdrop and centered login card
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-deep-plum lg:h-screen lg:overflow-hidden flex flex-col">
      <div className="mx-auto flex h-full w-full max-w-[1700px] flex-col flex-1">
        {/* Logo header */}
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

        {/* Main content */}
        <main className="relative flex min-h-0 flex-1 flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* ═══ LEFT: Hero Section (Desktop only) ═══ */}
          <section
            className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden bg-[#2b0d29] px-8 lg:w-[55%] lg:px-12 lg:py-6 xl:px-16"
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

            <div className="relative z-10 w-full max-w-[620px]">
              <div className="flex items-center gap-3 text-[#f2c8d9]">
                <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Welcome Back
                </span>
                <span className="h-px w-10 bg-[#f2c8d9]/60" aria-hidden="true" />
              </div>

              <h1 className="mt-4 max-w-[500px] text-4xl font-bold leading-[0.95] text-white sm:text-5xl lg:text-[3.35rem] xl:text-[4rem]">
                Rekindle Your
                <br />
                <span className="italic text-[#f2c8d9]">Next Experience</span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75 sm:text-base">
                {siteConfig.loginDescription}
              </p>

              <div className="mt-8 space-y-4 sm:mt-10">
                {trustIndicators.map((indicator) => {
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
                        <p className="text-xs text-white/60">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p
                className="mt-10 font-serif text-xl italic text-[#f0d3df]/80 sm:text-2xl"
                aria-hidden="true"
              >
                More People. More Experiences. ♡
              </p>
            </div>
          </section>

          {/* ═══ RIGHT: Login Card (Mobile full scroll + Desktop centered) ═══ */}
          <section
            className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:w-[45%] lg:px-8 xl:px-12 bg-deep-plum lg:bg-warm-white overflow-y-auto"
            aria-label="Login form"
          >
            <div className="w-full max-w-[460px] rounded-2xl sm:rounded-[30px] bg-white p-5 sm:p-7 shadow-[0_20px_55px_rgba(54,18,44,0.18)] ring-1 ring-soft-border/80 my-auto">
              <LoginForm />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
