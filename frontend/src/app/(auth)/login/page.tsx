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
 * Login page matching the Companionly reference design.
 *
 * Layout:
 *   Desktop — Split: left hero (55%) + right login card (45%)
 *   Mobile  — Stacked: condensed hero background + login card
 *
 * Background image:
 *   Currently uses a placeholder gradient. When the real image is
 *   available at /public/assets/login-background.webp, uncomment the
 *   <Image> tag below and it will render with the overlay on top.
 */
export default function LoginPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
      {/* ═══ LEFT: Hero Section ═══ */}
      <section
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#2b0d29] px-5 py-5 sm:px-8 lg:w-[55%] lg:px-12 lg:py-6 xl:px-16"
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">
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
            {siteConfig.description}
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

      {/* ═══ RIGHT: Login Card ═══ */}
      <section
        className="flex flex-1 items-center justify-center bg-warm-white px-4 py-6 sm:px-6 lg:w-[45%] lg:px-8 xl:px-12"
        aria-label="Login form"
      >
        <div className="w-full max-w-[460px] rounded-[30px] bg-white/80 p-4 shadow-[0_20px_55px_rgba(54,18,44,0.12)] ring-1 ring-soft-border backdrop-blur-sm sm:p-6 lg:p-7">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
