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

interface ApiCompanionResponse {
  success: boolean;
  data: {
    companion: ApiCompanion;
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
