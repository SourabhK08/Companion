"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────

export interface ReviewUser {
  id: string;
  fullName: string;
  avatar: string | null;
  city?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  reviewerRole: "CLIENT" | "COMPANION";
  createdAt: string;
  reviewer: ReviewUser;
  reviewee: ReviewUser;
}

export interface ReviewStats {
  averageRating: number;
  totalCount: number;
  breakdown: Record<number, number>;
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── useReviews — Paginated reviews for a user ────────────

export function useReviews(userId: string | undefined, page: number = 1, limit: number = 10) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<ReviewsPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { reviews: Review[]; pagination: ReviewsPagination };
      }>(`/api/reviews/user/${userId}?page=${page}&limit=${limit}`);
      if (res.success) {
        setReviews(res.data.reviews);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, pagination, isLoading, error, refetch: fetchReviews };
}

// ─── useReviewStats — Rating breakdown for a user ─────────

export function useReviewStats(userId: string | undefined) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    apiFetch<{ success: boolean; data: ReviewStats }>(`/api/reviews/stats/${userId}`)
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { stats, isLoading };
}

// ─── useCanReview — Check if user can review a booking ────

export function useCanReview(bookingId: string | undefined) {
  const [canReview, setCanReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setIsLoading(true);
    apiFetch<{ success: boolean; data: { canReview: boolean } }>(
      `/api/reviews/can-review/${bookingId}`
    )
      .then((res) => {
        if (res.success) setCanReview(res.data.canReview);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  return { canReview, isLoading };
}

// ─── useSubmitReview — Submit a booking review ────────────

export function useSubmitReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = useCallback(
    async (bookingId: string, rating: number, comment?: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await apiFetch<{
          success: boolean;
          message: string;
          data: {
            review: Review;
            updatedRating: number | null;
            updatedReviewCount: number | null;
          };
        }>("/api/reviews", {
          method: "POST",
          body: JSON.stringify({ bookingId, rating, comment: comment || null }),
        });
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to submit review";
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { submitReview, isSubmitting, error };
}

// ─── App Reviews Types ─────────────────────────────────────

export interface AppReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser;
}

export interface MyAppReview {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── useAppReviews — List approved app reviews ──────────────

export function useAppReviews(page: number = 1, limit: number = 10) {
  const [reviews, setReviews] = useState<AppReviewItem[]>([]);
  const [pagination, setPagination] = useState<ReviewsPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { reviews: AppReviewItem[]; pagination: ReviewsPagination };
      }>(`/api/reviews/app?page=${page}&limit=${limit}`);
      if (res.success) {
        setReviews(res.data.reviews);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, pagination, isLoading, error, refetch: fetchReviews };
}

// ─── useMyAppReview — Get authenticated user's app review ───

export function useMyAppReview(enabled: boolean = true) {
  const [myReview, setMyReview] = useState<MyAppReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyReview = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: { review: MyAppReview | null } }>(
        "/api/reviews/app/me"
      );
      if (res.success) {
        setMyReview(res.data.review);
      }
    } catch {
      // not critical
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchMyReview();
  }, [fetchMyReview]);

  return { myReview, isLoading, refetch: fetchMyReview };
}

// ─── useSubmitAppReview — Submit or update app review ───────

export function useSubmitAppReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAppReview = useCallback(async (rating: number, comment: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        data: { review: MyAppReview };
      }>("/api/reviews/app", {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitAppReview, isSubmitting, error };
}

