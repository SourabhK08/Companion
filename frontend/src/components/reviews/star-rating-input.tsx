"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "cn";

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizeMap = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
};

export function StarRatingInput({ value, onChange, size = "md", disabled = false }: StarRatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const displayValue = hoveredStar || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          className={cn(
            "transition-transform focus:outline-none",
            !disabled && "cursor-pointer hover:scale-110 active:scale-95",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              "transition-colors",
              star <= displayValue
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-[#2d111b]">
          {value}.0
        </span>
      )}
    </div>
  );
}

// ─── Read-Only Star Display ───────────────────────────────

export function StarRatingDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200"
          )}
        />
      ))}
    </div>
  );
}
