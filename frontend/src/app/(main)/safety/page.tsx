import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  ChevronRight,
  CircleAlert,
  HeartHandshake,
  Lock,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";

const trustCards = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "All companions go through identity verification and background checks.",
    badge: "Verified",
  },
  {
    icon: WalletCards,
    title: "Secure Payments",
    description: "Your payments are encrypted and protected with industry-standard security.",
    badge: "Secure",
  },
  {
    icon: Users,
    title: "Safe Interactions",
    description: "We monitor for suspicious activity and provide 24/7 support.",
    badge: "Monitored",
  },
  {
    icon: CircleAlert,
    title: "No Harassment",
    description: "We have a zero-tolerance policy for harassment, abuse or inappropriate behavior.",
    badge: "Zero Tolerance",
  },
];

const safetyGuidelines = [
  {
    icon: UserCheck,
    title: "Meet in Public Places",
    text: "Always choose safe, public locations for your meetings.",
  },
  {
    icon: MessageSquareText,
    title: "Keep Communication on App",
    text: "Share personal contact details only when you feel comfortable.",
  },
  {
    icon: BellRing,
    title: "Report Suspicious Activity",
    text: "If something feels wrong, report it immediately. Our team is here to help.",
  },
  {
    icon: Lock,
    title: "Protect Your Personal Information",
    text: "Do not share sensitive information like your address, financial details, or ID.",
  },
  {
    icon: HeartHandshake,
    title: "Be Respectful",
    text: "Treat everyone with kindness and respect. Harassment is not allowed.",
  },
];

const quickLinks = [
  "Reporting & Blocking",
  "Community Guidelines",
  "Safety Tips",
  "Terms & Conditions",
];

export default function SafetyPage() {
  return (
    <main className="bg-[#f6efe9] px-3 py-4 sm:px-5 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1400px]">
        <section className="relative overflow-hidden rounded-[26px] border border-[#e9d1d7] bg-[#f6e7e4] px-4 py-5 shadow-[0_8px_22px_rgba(122,31,57,0.04)] sm:px-6 lg:px-8 lg:py-7">
          <div className="absolute -right-6 top-0 h-28 w-28 rounded-full bg-[#f3d7dd]/80 blur-2xl" aria-hidden="true" />
          <div className="absolute right-3 top-3 hidden h-28 w-28 rounded-full border border-[#d29aa4]/50 bg-[#f1dfe4]/60 md:block" aria-hidden="true" />
          <div className="absolute right-10 top-14 hidden h-16 w-16 rotate-12 rounded-full border border-[#d29aa4]/40 bg-white/10 md:block" aria-hidden="true" />
          <div className="absolute -bottom-7 -right-5 h-24 w-24 rounded-full bg-[#eac7d3]/60 blur-xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border-[3px] border-[#7a1f39] bg-[#f1dfe4] shadow-[inset_0_0_0_8px_rgba(122,31,57,0.04)] sm:h-[76px] sm:w-[76px]">
                <Shield className="h-8 w-8 text-[#7a1f39] sm:h-10 sm:w-10" strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <h1 className="text-[28px] font-bold tracking-[-0.05em] text-[#4d0d1d] sm:text-[34px] lg:text-[52px]">
                  Trust &amp; Safety
                </h1>
                <p className="mt-2 max-w-[740px] text-[12.5px] font-medium leading-relaxed text-[#5f3139] sm:text-[14px] lg:text-[17px]">
                  Your safety and trust are our top priority. We work hard to make Modhuralap a safe,
                  respectful and secure space for everyone.
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-center xl:justify-end">
              <div className="hidden h-[105px] w-[105px] rotate-[-12deg] rounded-full border border-[#d9a3ad]/60 bg-[#f3dfe4]/70 md:block" aria-hidden="true" />
              <div className="relative ml-[-8px] mt-1 text-right font-serif italic text-[#7a1f39]">
                <div className="text-[22px] leading-none sm:text-[28px] lg:text-[36px]">Safe People</div>
                <div className="mt-1 text-[20px] leading-none sm:text-[24px] lg:text-[32px]">Better Connections</div>
                <div className="mt-2 flex justify-end text-[#7a1f39]">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {trustCards.map(({ icon: Icon, title, description, badge }) => (
            <div
              key={title}
              className="rounded-[18px] border border-[#e7d0d5] bg-[#f8efee] p-4 shadow-[0_8px_18px_rgba(122,31,57,0.02)] sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f2dfe4] text-[#7a1f39] sm:h-[44px] sm:w-[44px]">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <h2 className="text-[18px] font-bold tracking-[-0.04em] text-[#4d0d1d]">{title}</h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[#5f3139]">{description}</p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#8ecaa8] bg-[#e7f6ec] px-3 py-1.5 text-[11px] font-semibold text-[#1a7c46] sm:text-[12px]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2ab66c] text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {badge}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(290px,0.8fr)]">
          <div className="rounded-[22px] border border-[#e7d0d5] bg-[#f8efee] p-4 shadow-[0_8px_18px_rgba(122,31,57,0.02)] sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f1dfe4] text-[#7a1f39]">
                <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <h2 className="text-[26px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[30px]">Safety Guidelines</h2>
            </div>
            <p className="mt-2 text-[13px] text-[#5f3139] sm:text-[15px]">
              Follow these simple guidelines to have a safe and enjoyable experience.
            </p>

            <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e7d0d5] bg-[#f9f3f2]">
              {safetyGuidelines.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex items-center justify-between gap-3 border-b border-[#ead9dc] px-3 py-3 last:border-b-0 sm:px-4 sm:py-4"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#f0dfe4] text-[#7a1f39] ring-1 ring-[#e4b7c1] sm:h-[40px] sm:w-[40px]">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold tracking-[-0.03em] text-[#4d0d1d] sm:text-[18px]">{title}</div>
                      <div className="text-[11.5px] leading-relaxed text-[#5f3139] sm:text-[13px]">{text}</div>
                    </div>
                  </div>

                  {/* <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#7a1f39] shadow-sm ring-1 ring-[#e5ccd2] transition-colors hover:bg-[#f9eef0] sm:h-9 sm:w-9"
                    aria-label={`View ${title}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button> */}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-[#e7d0d5] bg-[#f3dfe4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#7a1f39] text-white sm:h-[38px] sm:w-[38px]">
                  <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="text-[18px] font-bold tracking-[-0.03em] text-[#4d0d1d] sm:text-[20px]">Need Immediate Help?</div>
                  <div className="text-[11.5px] text-[#5f3139] sm:text-[13px]">Our 24/7 support team is always here for you.</div>
                </div>
              </div>

              <Link
                href="/support"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7a1f39] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(122,31,57,0.18)] transition-colors hover:bg-[#661a2d] sm:px-5 sm:text-[14px]"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[20px] border border-[#e7d0d5] bg-[#f8efee] p-4 shadow-[0_8px_18px_rgba(122,31,57,0.02)] sm:p-5 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f2dfe4] text-[#7a1f39] sm:h-[34px] sm:w-[34px]">
                  <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-[24px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[30px]">Your Safety Matters</h3>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-[#5f3139] sm:text-[15px]">
                We&apos;re committed to creating a safe, positive and trusted community for all our users.
              </p>

              <div className="mt-4 space-y-3">
                {[
                  "Real people, real profiles",
                  "24/7 support & assistance",
                  "Strict community guidelines",
                  "Continuous monitoring for safety",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-[13px] font-medium text-[#4d0d1d] sm:text-[15px]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[#ffffff] shadow-sm">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e7d0d5] bg-[#f2dfe4] p-4 shadow-[0_8px_18px_rgba(122,31,57,0.02)] sm:p-5 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-[2px] border-[#7a1f39] bg-[#f8efee] text-[#7a1f39] sm:h-[34px] sm:w-[34px]">
                  <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-[22px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[28px]">Quick Links</h3>
              </div>

              <div className="mt-4 space-y-2">
                {quickLinks.map((label) => (
                  <Link
                    key={label}
                    href="#"
                    className="flex items-center justify-between rounded-[12px] border border-[#e8c7cf] bg-[#f8f0f1] px-3 py-3 text-[13px] font-medium text-[#5d2332] transition-colors hover:bg-white sm:text-[15px]"
                  >
                    <span>{label}</span>
                    <ChevronRight className="h-4 w-4 text-[#7a1f39]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[22px] border border-[#e7d0d5] bg-[#f3dfe4] px-4 py-4 shadow-[0_8px_18px_rgba(122,31,57,0.04)] sm:px-5 sm:py-5 lg:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-[#7a1f39] bg-[#f7e8eb] text-[#7a1f39] shadow-[inset_0_0_0_8px_rgba(122,31,57,0.04)] sm:h-[82px] sm:w-[82px]">
                <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.3} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#4d0d1d] sm:text-[18px]">Together for a Safer Community</div>
                <div className="text-[26px] font-bold tracking-[-0.04em] text-[#4d0d1d] sm:text-[32px]">Safe Together</div>
              </div>
            </div>

            <div className="flex h-[88px] w-[170px] items-center justify-center rounded-[16px] border border-[#e5c4cc] bg-[linear-gradient(180deg,#e9cbd2_0%,#f8efee_100%)] text-[#7a1f39] shadow-inner sm:h-[110px] sm:w-[220px]">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-[3px] border-[#7a1f39] bg-[#f7e5e9] text-[#7a1f39] sm:h-[80px] sm:w-[80px]">
                <Shield className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={2.3} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
