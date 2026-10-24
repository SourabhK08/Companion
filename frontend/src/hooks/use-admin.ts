"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReviewUser } from "./use-reviews";

const ADMIN_TOKEN_KEY = "modhuralap_admin_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AdminAppReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

export interface AdminReviewStats {
  total: number;
  pendingCount: number;
  approvedCount: number;
  averageRating: number;
}

interface AdminReviewsData {
  all: AdminAppReview[];
  pending: AdminAppReview[];
  approved: AdminAppReview[];
  stats: AdminReviewStats;
}

export function useAdmin() {
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsData, setReviewsData] = useState<AdminReviewsData | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (stored) {
        setToken(stored);
      }
    } catch {
      // localStorage unavailable or restricted
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Helper for admin fetch calls
  const adminFetch = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const currentToken = token || localStorage.getItem(ADMIN_TOKEN_KEY);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }

      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          try {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
          } catch {}
          setToken(null);
        }
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data as T;
    },
    [token]
  );

  // Fetch all reviews for admin moderation
  const fetchReviews = useCallback(async () => {
    if (!token && !localStorage.getItem(ADMIN_TOKEN_KEY)) return;
    setIsLoadingReviews(true);
    setActionError(null);
    try {
      const res = await adminFetch<{ success: boolean; data: AdminReviewsData }>(
        "/api/admin/reviews"
      );
      if (res.success) {
        setReviewsData(res.data);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to load admin reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  }, [adminFetch, token]);

  // Load reviews whenever authenticated
  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token, fetchReviews]);

  // Admin login
  const login = async (username: string, password: string) => {
    setActionError(null);
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Invalid admin credentials");
    }

    const adminToken = data.data.token as string;
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
    } catch {}
    setToken(adminToken);
    return data;
  };

  // Admin logout
  const logout = () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
    setToken(null);
    setReviewsData(null);
  };

  // Approve a review
  const approveReview = async (id: string) => {
    setActionError(null);
    try {
      await adminFetch(`/api/admin/reviews/${id}/approve`, { method: "PATCH" });
      await fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to approve review";
      setActionError(msg);
      throw err;
    }
  };

  // Reject a review (move back to moderation / unpublish)
  const rejectReview = async (id: string) => {
    setActionError(null);
    try {
      await adminFetch(`/api/admin/reviews/${id}/reject`, { method: "PATCH" });
      await fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unpublish review";
      setActionError(msg);
      throw err;
    }
  };

  // Delete a review permanently
  const deleteReview = async (id: string) => {
    setActionError(null);
    try {
      await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      await fetchReviews();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      setActionError(msg);
      throw err;
    }
  };

  return {
    isAuthenticated: Boolean(token),
    isInitializing,
    isLoadingReviews,
    reviewsData,
    actionError,
    login,
    logout,
    fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
  };
}
