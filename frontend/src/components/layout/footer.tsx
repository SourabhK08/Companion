"use client";

import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { footerLinks, socialLinks } from "@/config/site";

/**
 * Inline SVG icons for social media platforms.
 * Lucide does not include brand icons for trademark reasons.
 * Replace these with actual brand SVGs from /public/assets/ when available.
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
      return <Globe className={cn("size-4", className)} aria-hidden="true" />;
  }
}

/**
 * Site-wide footer matching the reference design.
 *
 * Deep plum background with:
 *   - Brand logo + social icons
 *   - 4 navigation groups (Explore, Trust & Safety, Company, Help)
 *   - Newsletter signup
 *   - Copyright + legal links
 *
 * Responsive: 6-column grid on desktop → stacked on mobile.
 */
export function Footer() {
  return (
    <footer className="bg-deep-plum text-white" role="contentinfo">
      {/* Main footer content */}
      <div className="mx-auto max-w-[1400px] px-4 pt-12 pb-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand + Socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" size="sm" />

            {/* Social links */}
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex size-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white hover:bg-white/10"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation groups */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-white">
                {group.title}
              </h3>
              <ul className="space-y-2" role="list">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">
              Subscribe to our newsletter
            </h3>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                className="h-9 flex-1 rounded-lg border-white/20 bg-white/10 text-sm text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-white/20"
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg bg-berry hover:bg-berry-dark text-white border-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-4 text-xs text-white/50 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Modhuralap. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms & Conditions
            </Link>
            <span className="text-white/20">|</span>
            <span>18+ Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
