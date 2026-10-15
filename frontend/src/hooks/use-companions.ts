"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";
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
  bio: string | null;
  interests: string[];
  languages: string[];
  dateOfBirth: string | null;
  isVerified: boolean;
}

interface ApiCompanion {
  id: string;
  userId: string;
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

function calculateAge(dob: string | null): number {
  if (!dob) return 25; // Default fallback age
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Map API companion to the frontend Companion type
 * used by CompanionCard component.
 */
function mapApiToCompanion(api: ApiCompanion): Companion {
  return {
    id: api.id,
    userId: api.userId,
    name: api.user.fullName,
    age: calculateAge(api.user.dateOfBirth),
    profession: api.user.bio ? api.user.bio.split(".")[0].slice(0, 40) : "Professional",
    city: api.user.city ?? "Kolkata",
    interests: api.user.interests,
    pricePerHour: api.hourlyRate,
    rating: api.rating,
    reviews: api.reviewCount,
    responseRate: api.responseRate,
    isVerified: api.user.isVerified,
    avatar: api.user.avatar,
    bio: api.user.bio || "",
    languages: api.user.languages,
    gender: (api.user.gender as Companion["gender"]) ?? "other",
    isCompanion: api.isAvailable,
  };
}

interface UseCompanionsOptions {
  gender?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  age?: string;
  minAge?: number;
  maxAge?: number;
  sortBy?: string;
  interests?: string;
  languages?: string;
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
  const { user } = useAuth();
  const userId = user?.id;
  const {
    gender,
    city,
    search,
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    age,
    minAge,
    maxAge,
    sortBy,
    interests,
    languages,
  } = options;
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setRefetchIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const params = new URLSearchParams();
        if (gender && gender !== "Any" && gender !== "any") params.set("gender", gender);
        if (city && city !== "All" && city !== "all") params.set("city", city);
        if (search && search.trim()) params.set("search", search.trim());
        if (minPrice !== undefined) params.set("minPrice", String(minPrice));
        if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
        if (age) params.set("age", age);
        if (minAge !== undefined) params.set("minAge", String(minAge));
        if (maxAge !== undefined) params.set("maxAge", String(maxAge));
        if (sortBy) params.set("sortBy", sortBy);
        if (interests) params.set("interests", interests);
        if (languages) params.set("languages", languages);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const response = await apiFetch<ApiCompanionsResponse>(
          `/api/companions?${params.toString()}`
        );

        if (!ignore && response.success && response.data) {
          const mapped = response.data.companions.map(mapApiToCompanion);
          setCompanions(userId ? mapped.filter((c) => c.userId !== userId) : mapped);
          setPagination(response.data.pagination);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Failed to fetch companions";
          setError(message);
          setCompanions([]);
          setPagination(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [
    gender,
    city,
    search,
    page,
    limit,
    minPrice,
    maxPrice,
    age,
    minAge,
    maxAge,
    sortBy,
    interests,
    languages,
    userId,
    refetchIndex,
  ]);

  return { companions, pagination, isLoading, error, refetch };
}
