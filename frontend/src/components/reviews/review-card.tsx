"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "cn";
import type { Review } from "@/hooks/use-reviews";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ReviewCard({ review }: { review: Review }) {
  const reviewer = review.reviewer;
  const [imageError, setImageError] = useState(false);

  return (
    <div className="rounded-xl border border-[#f0dfe3] bg-white p-4 shadow-xs">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] flex items-center justify-center text-white text-xs font-bold">
          {reviewer.avatar && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={reviewer.avatar}
              alt={reviewer.fullName}
              className="size-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            reviewer.fullName
              ? reviewer.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "U"
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[#2d111b]">{reviewer.fullName}</h4>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              Verified Booking
            </span>
            {reviewer.city && (
              <span className="text-[10px] text-[#6a4953]">
                • {reviewer.city}
              </span>
            )}
          </div>

          {/* Stars + Date */}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "size-3.5",
                    star <= review.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#6a4953]">
              {formatRelativeDate(review.createdAt)}
            </span>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm text-[#4a2b35] leading-relaxed">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
