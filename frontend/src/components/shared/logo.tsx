import { cn } from "cn";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
  /** Render in light mode (white text) for dark backgrounds. */
  variant?: "default" | "light";
  /** Show the tagline beneath the brand name. */
  showTagline?: boolean;
  /** Size variant. */
  size?: "sm" | "default" | "lg";
}

/**
 * Companionly brand logo.
 *
 * Displays an SVG icon + "Companionly" text + optional tagline.
 * The SVG is an intertwined hearts motif matching the reference design.
 *
 * Future: Replace the inline SVG with /public/assets/logo.svg when available.
 */
export function Logo({
  className,
  variant = "default",
  showTagline = true,
  size = "default",
}: LogoProps) {
  const textColor =
    variant === "light" ? "text-white" : "text-foreground";
  const taglineColor =
    variant === "light" ? "text-white/70" : "text-muted-foreground";

  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textSize =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  const taglineSize = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Intertwined hearts icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left heart */}
        <path
          d="M16 12c-4.4 0-8 3.6-8 8 0 8 12 16 16 18-1.5-1-4-3-6-5.5C12 26.5 8 21 8 17c0-3.3 2.7-6 6-6 1.8 0 3.4.8 4.5 2l1.5 2 1.5-2c1.1-1.2 2.7-2 4.5-2"
          fill={variant === "light" ? "rgba(255,255,255,0.8)" : "oklch(0.72 0.07 340)"}
        />
        {/* Right heart */}
        <path
          d="M32 12c4.4 0 8 3.6 8 8 0 8-12 16-16 18 1.5-1 4-3 6-5.5C36 26.5 40 21 40 17c0-3.3-2.7-6-6-6-1.8 0-3.4.8-4.5 2l-1.5 2-1.5-2c-1.1-1.2-2.7-2-4.5-2"
          fill={variant === "light" ? "white" : "oklch(0.38 0.16 340)"}
        />
        {/* Center overlap */}
        <path
          d="M24 38c-1.5-1-4-3-6-5.5 2-2.5 4-5 5-7.5 1 2.5 3 5 5 7.5-2 2.5-4 4.5-4 5.5z"
          fill={variant === "light" ? "rgba(255,255,255,0.6)" : "oklch(0.55 0.12 340)"}
        />
      </svg>

      <div className="flex flex-col">
        <span className={cn("font-bold tracking-tight leading-tight", textColor, textSize)}>
          {siteConfig.name}
        </span>
        {showTagline && (
          <span className={cn("leading-tight tracking-wide", taglineColor, taglineSize)}>
            {siteConfig.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
