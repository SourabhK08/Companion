"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Companion } from "@/config/companions-data";

/**
 * API response types from GET /api/companions
 */
interface ApiCompanionUser {
  id: string;
  fullName: string;
  email: string;
  gender: string | null;
  city: string | null;
  avatar: string | null;
  isVerified: boolean;
}

interface ApiCompanion {
  id: string;
  userId: string;
  bio: string;
  interests: string[];
  languages: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user: ApiCompanionUser;
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiCompanionsResponse {
  success: boolean;
  data: {
    companions: ApiCompanion[];
    pagination: ApiPagination;
  };
}

/**
 * Map API companion to the frontend Companion type
 * used by CompanionCard component.
 */
function mapApiToCompanion(api: ApiCompanion): Companion {
  return {
    id: api.id,
    name: api.user.fullName,
    age: 0, // Age not stored yet — will show bio instead
    profession: api.bio.split(".")[0].slice(0, 40), // First sentence as profession
    city: api.user.city ?? "Kolkata",
    interests: api.interests,
    pricePerHour: api.hourlyRate,
    rating: api.rating,
    reviews: api.reviewCount,
    responseRate: api.responseRate,
    isVerified: api.user.isVerified,
    avatar: api.user.avatar,
    bio: api.bio,
    languages: api.languages,
    gender: (api.user.gender as Companion["gender"]) ?? "other",
  };
}

interface UseCompanionsOptions {
  gender?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseCompanionsResult {
  companions: Companion[];
  pagination: ApiPagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch companions from the backend API.
 *
 * Usage:
 *   const { companions, pagination, isLoading } = useCompanions({ gender: "male" });
 */
export function useCompanions(options: UseCompanionsOptions = {}): UseCompanionsResult {
  const { gender, city, search, page = 1, limit = 12 } = options;
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (gender) params.set("gender", gender);
      if (city) params.set("city", city);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const response = await apiFetch<ApiCompanionsResponse>(
        `/api/companions?${params.toString()}`
      );

      if (response.success && response.data) {
        setCompanions(response.data.companions.map(mapApiToCompanion));
        setPagination(response.data.pagination);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch companions";
      setError(message);
      setCompanions([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [gender, city, search, page, limit]);

  useEffect(() => {
    fetchCompanions();
  }, [fetchCompanions]);

  return { companions, pagination, isLoading, error, refetch: fetchCompanions };
}
