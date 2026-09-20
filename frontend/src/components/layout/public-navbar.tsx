"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "cn";

import { Logo } from "@/components/shared/logo";
import { navLinks } from "@/config/site";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Public navbar used on the signup page and other public pages.
 * Matches the Modhuralap reference: logo, nav links, "Already have an account? Login"
 */
export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-soft-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1700px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-berry",
                link.label === "Home" && "font-semibold text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Login */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Already have an account?
          </span>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-full border border-berry px-5 text-sm font-semibold text-berry transition-colors hover:bg-berry hover:text-white"
          >
            Login
          </Link>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-soft-border pt-4">
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center rounded-full bg-berry py-2.5 text-sm font-semibold text-white hover:bg-berry-dark"
                  >
                    Login
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
