"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";

/**
 * Inline SVG icons for social media platforms.
 */
function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  const size = 16;
  const svgClass = cn("shrink-0", className);

  switch (icon) {
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={svgClass} aria-hidden="true">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={svgClass} aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "twitter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={svgClass} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={svgClass} aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "youtube":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={svgClass} aria-hidden="true">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
      </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={svgClass} aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Dashboard/main footer matching the new Figma reference.
 *
 * Used on every authenticated page (dashboard, explore, etc.)
 * Layout: Logo + social | Explore | Support | Company | Newsletter | Legal bar
 */
export function DashboardFooter() {
  return (
    <footer className="border-t border-soft-border bg-deep-plum text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {/* Brand + Social */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo variant="light" size="sm" />
            <div className="mt-4 flex items-center gap-3">
              {["instagram", "whatsapp", "facebook", "youtube", "twitter", "linkedin"].map(
                (icon) => (
                  <Link
                    key={icon}
                    href="#"
                    className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                    aria-label={icon}
                  >
                    <SocialIcon icon={icon} className="size-3.5" />
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Explore</h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Male Companions", href: "/explore/male" },
                { label: "Female Companions", href: "/explore/female" },
                { label: "Events", href: "/events" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/50 transition-colors hover:text-white/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Support</h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Help Center", href: "/support" },
                { label: "Trust & Safety", href: "/safety" },
                { label: "Community Guidelines", href: "/community-guidelines" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/50 transition-colors hover:text-white/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">Company</h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "About Us", href: "/about" },
                { label: "Become a Partner", href: "/become-partner" },
                { label: "Careers", href: "/careers" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-white/50 transition-colors hover:text-white/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Tagline */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
              Subscribe to our newsletter
            </h4>
            <div className="mt-3 flex gap-1.5">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="h-8 flex-1 rounded-lg border-white/15 bg-white/8 text-xs text-white placeholder:text-white/30 focus-visible:border-dusty-rose focus-visible:ring-dusty-rose/20"
              />
              <button
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-berry text-white transition-colors hover:bg-berry-dark"
                aria-label="Subscribe"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </div>
            <p className="mt-4 font-serif text-xs italic text-white/25 leading-relaxed">
              Meaningful Connections
              <br />
              A Kinder World ♡
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-4 text-[10px] text-white/40 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Modhuralap. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="transition-colors hover:text-white/60">
              Privacy Policy
            </Link>
            <span className="text-white/15">|</span>
            <Link href="/terms" className="transition-colors hover:text-white/60">
              Terms & Conditions
            </Link>
            <span className="text-white/15">|</span>
            <span>18+ Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
