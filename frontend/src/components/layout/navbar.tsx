"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ArrowRight } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { navLinks } from "@/config/site";

/**
 * Top navigation bar matching the reference design.
 *
 * Desktop: Logo | nav links | CTA button
 * Mobile: Logo | hamburger → Sheet slide-in menu
 *
 * Uses the deep plum background with white text.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-deep-plum">
      <nav
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="Companionly home">
          <Logo variant="light" size="sm" />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 lg:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-white/80",
                  "transition-colors hover:text-white hover:bg-white/10",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-plum"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Button
            className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full px-5 h-9 text-sm font-medium"
            variant="outline"
          >
            Book a Companion
            <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[300px] bg-deep-plum text-white border-l-white/10"
          >
            <SheetHeader className="border-b border-white/10 pb-4">
              <SheetTitle className="text-white">
                <Logo variant="light" size="sm" showTagline={false} />
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-white/10" />

              <Button
                className="bg-white/15 text-white border-white/20 hover:bg-white/25 rounded-full h-11 text-sm font-medium mt-2 w-full"
                variant="outline"
              >
                Book a Companion
                <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
