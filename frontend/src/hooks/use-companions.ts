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
  const { gender, city, search, page = 1, limit = 12, minPrice, maxPrice, sortBy, interests, languages } = options;
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (gender && gender !== "Any") params.set("gender", gender);
      if (city) params.set("city", city);
      if (search) params.set("search", search);
      if (minPrice !== undefined) params.set("minPrice", String(minPrice));
      if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
      if (sortBy) params.set("sortBy", sortBy);
      if (interests) params.set("interests", interests);
      if (languages) params.set("languages", languages);
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
  }, [gender, city, search, page, limit, minPrice, maxPrice, sortBy, interests, languages]);

  useEffect(() => {
    fetchCompanions();
  }, [fetchCompanions]);

  return { companions, pagination, isLoading, error, refetch: fetchCompanions };
}
