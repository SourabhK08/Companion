"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import type { Companion } from "@/config/companions-data";

/**
 * API response type from GET /api/companions/:id
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

interface ApiCompanionResponse {
  success: boolean;
  data: {
    companion: ApiCompanion;
  };
}

function mapApiToCompanion(api: ApiCompanion): Companion {
  return {
    id: api.id,
    name: api.user.fullName,
    age: 28, // Mock age until added to DB
    profession: api.bio.split(".")[0].slice(0, 40) || "Professional",
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

interface UseCompanionResult {
  companion: Companion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCompanion(id: string): UseCompanionResult {
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanion = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<ApiCompanionResponse>(`/api/companions/${id}`);

      if (response.success && response.data?.companion) {
        setCompanion(mapApiToCompanion(response.data.companion));
      } else {
        setError("Companion not found");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch companion profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanion();
  }, [fetchCompanion]);

  return { companion, isLoading, error, refetch: fetchCompanion };
}
