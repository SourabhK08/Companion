"use client";

import { useState } from "react";
import {
  Star,
  MessageSquareHeart,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Heart,
  User,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  useAppReviews,
  useMyAppReview,
  useSubmitAppReview,
  type AppReviewItem,
} from "@/hooks/use-reviews";
import { StarRatingInput, StarRatingDisplay } from "@/components/reviews/star-rating-input";

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

export default function AppReviewsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { reviews, pagination, isLoading, refetch: refetchReviews } = useAppReviews(page, 9);
  const { myReview, isLoading: myReviewLoading, refetch: refetchMyReview } = useMyAppReview(Boolean(user));
  const { submitAppReview, isSubmitting, error: submitError } = useSubmitAppReview();

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim().length < 10) return;

    try {
      await submitAppReview(rating, comment.trim());
      setSubmitSuccess(true);
      refetchMyReview();
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
        setComment("");
      }, 1800);
    } catch {
      // handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* ─── Hero Header ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2d111b] via-[#4a1c2b] to-[#7a1f39] p-8 sm:p-12 text-white shadow-xl">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm text-[#f4dbe2] mb-4">
              <Sparkles className="size-3.5" />
              Community Stories
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What People Say About Modhuralap
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#f0dfe3]/90 leading-relaxed">
              Real reflections from genuine companions and clients creating memorable moments,
              respectful friendships, and safe offline experiences across India.
            </p>

            {user && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="rounded-full bg-white text-[#7a1f39] hover:bg-[#fbeaf0] font-bold text-sm shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <MessageSquareHeart className="mr-2 size-4" />
                  {myReview ? "Edit Your Review" : "Share Your Experience"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ─── User's Own Review Banner / Submission Form ─── */}
        {user && isFormOpen && (
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2d111b]">
                  {myReview ? "Update Your Platform Review" : "How is your Modhuralap experience?"}
                </h3>
                <p className="text-xs sm:text-sm text-[#6a4953] mt-0.5">
                  Your feedback helps us keep the community safe, genuine, and welcoming.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xs font-semibold text-[#6a4953] hover:text-[#2d111b] cursor-pointer"
              >
                Close
              </button>
            </div>

            {submitSuccess ? (
              <div className="mt-6 flex flex-col items-center py-6 text-center">
                <div className="size-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="text-base font-bold text-[#2d111b]">Review Submitted!</h4>
                <p className="text-xs text-[#6a4953] mt-1 max-w-sm">
                  Thank you for your valuable feedback. It will be published after our team completes moderation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#6a4953] mb-2">
                    Your Overall Rating
                  </label>
                  <StarRatingInput value={rating} onChange={setRating} size="lg" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6a4953] mb-1.5">
                    Your Thoughts & Experience <span className="text-[10px] text-[#6a4953]/70">(min 10 characters)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder="Tell us what you love about Modhuralap or how it has helped you meet great people..."
                    className="w-full rounded-xl border border-[#f0dfe3] p-4 text-sm text-[#2d111b] placeholder:text-[#6a4953]/50 focus:border-[#7a1f39] focus:outline-none focus:ring-2 focus:ring-[#7a1f39]/20"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[#6a4953]">
                    <span>{comment.trim().length < 10 ? `Need at least ${10 - comment.trim().length} more characters` : "Looks good!"}</span>
                    <span>{comment.length}/500</span>
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs font-semibold text-red-600">{submitError}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
                    className="rounded-xl bg-[#7a1f39] text-white hover:bg-[#661b2f] px-6 text-sm font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-xl border-[#f0dfe3] text-[#6a4953] hover:bg-[#fdfafb] text-sm cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─── Existing User Review Status ─── */}
        {user && myReview && !isFormOpen && (
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39]">
                <Star className="size-5 fill-[#7a1f39]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#2d111b]">Your Review: {myReview.rating}.0 ★</p>
                  {myReview.isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="size-3" /> Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Clock className="size-3" /> Under Moderation
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6a4953] line-clamp-1 mt-0.5">&ldquo;{myReview.comment}&rdquo;</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRating(myReview.rating);
                setComment(myReview.comment);
                setIsFormOpen(true);
              }}
              className="rounded-lg border-[#f0dfe3] text-[#7a1f39] hover:bg-[#fbeaf0] text-xs font-semibold cursor-pointer shrink-0"
            >
              Edit Review
            </Button>
          </div>
        )}

        {/* ─── Trust Value Props ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39] shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d111b]">100% Verified Community</p>
              <p className="text-xs text-[#6a4953]">Government ID & OTP checked members</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39] shrink-0">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d111b]">Real Companionship</p>
              <p className="text-xs text-[#6a4953]">Café chats, city walks & offline meetups</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#f0dfe3] bg-white p-5 shadow-xs flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39] shrink-0">
              <Star className="size-5 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d111b]">Authentic Reviews</p>
              <p className="text-xs text-[#6a4953]">Honest reviews from actual verified bookings</p>
            </div>
          </div>
        </div>

        {/* ─── Community Reviews Grid ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2d111b] flex items-center gap-2">
              <MessageSquareHeart className="size-5 text-[#7a1f39]" />
              Community Reviews
            </h2>
            {pagination && (
              <span className="text-xs font-semibold text-[#6a4953]">
                {pagination.total} {pagination.total === 1 ? "review" : "reviews"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="size-8 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#f0dfe3] bg-white p-12 text-center">
              <div className="mx-auto size-14 rounded-full bg-[#fbeaf0] flex items-center justify-center text-[#7a1f39] mb-3">
                <Star className="size-6" />
              </div>
              <h3 className="text-base font-bold text-[#2d111b]">No public reviews yet</h3>
              <p className="text-xs text-[#6a4953] mt-1 max-w-sm mx-auto">
                Be the first to share your journey with the Modhuralap community!
              </p>
              {user && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 rounded-full bg-[#7a1f39] text-white hover:bg-[#661b2f] text-xs font-semibold"
                >
                  Write the First Review
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#f0dfe3] bg-white p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Stars + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <StarRatingDisplay rating={rev.rating} size="sm" />
                      <span className="text-[10px] text-[#6a4953] font-medium">
                        {formatRelativeDate(rev.createdAt)}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="mt-4 text-sm text-[#4a2b35] leading-relaxed line-clamp-4 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  {/* Reviewer info */}
                  <div className="mt-6 pt-4 border-t border-[#f0dfe3] flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                      {rev.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.user.avatar}
                          alt={rev.user.fullName}
                          className="size-full object-cover"
                        />
                      ) : (
                        rev.user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2d111b] truncate">
                        {rev.user.fullName}
                      </p>
                      <p className="text-[10px] text-[#6a4953] truncate">
                        {rev.user.city ? `${rev.user.city}, India` : "Community Member"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border-[#f0dfe3] text-xs font-semibold text-[#6a4953] cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-xs text-[#6a4953] px-2">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border-[#f0dfe3] text-xs font-semibold text-[#6a4953] cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
