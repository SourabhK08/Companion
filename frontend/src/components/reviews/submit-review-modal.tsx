"use client";

import { useState } from "react";
import { X, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRatingInput } from "./star-rating-input";
import { useSubmitReview } from "@/hooks/use-reviews";

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  onSuccess?: () => void;
}

export function SubmitReviewModal({
  isOpen,
  onClose,
  bookingId,
  partnerName,
  partnerAvatar,
  onSuccess,
}: SubmitReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { submitReview, isSubmitting, error } = useSubmitReview();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await submitReview(bookingId, rating, comment || undefined);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        // Reset state for next open
        setRating(0);
        setComment("");
        setSubmitted(false);
      }, 1500);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[#6a4953] hover:bg-[#f0dfe3] transition-colors"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center py-8 text-center">
            <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#2d111b]">Review Submitted!</h3>
            <p className="mt-1 text-sm text-[#6a4953]">Thank you for your feedback.</p>
          </div>
        ) : (
          /* Review form */
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] flex items-center justify-center text-white text-sm font-bold">
                {partnerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partnerAvatar} alt={partnerName} className="size-full object-cover" />
                ) : (
                  partnerName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2d111b]">Rate & Review</h3>
                <p className="text-sm text-[#6a4953]">How was your experience with {partnerName}?</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-[#fdfafb] border border-[#f0dfe3]">
              <p className="text-xs font-semibold text-[#6a4953]">Tap to rate</p>
              <StarRatingInput value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Comment */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-[#2d111b]">
                Write a review <span className="text-xs text-[#6a4953] font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Share your experience..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-[#f0dfe3] bg-white px-4 py-3 text-sm text-[#2d111b] placeholder:text-[#6a4953]/50 focus:border-[#7a1f39] focus:outline-none focus:ring-2 focus:ring-[#7a1f39]/20 resize-none"
              />
              <p className="mt-1 text-right text-[10px] text-[#6a4953]">
                {comment.length}/500
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl border-[#f0dfe3] text-[#6a4953] hover:bg-[#fdfafb]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="flex-1 rounded-xl bg-[#7a1f39] text-white hover:bg-[#661b2f] disabled:opacity-50"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
