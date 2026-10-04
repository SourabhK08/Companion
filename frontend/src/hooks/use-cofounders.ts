"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import type { ChatPlanId } from "@/config/cofounder-data";

// ─── Types ────────────────────────────────────────────────

export interface CoFounderUser {
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
  linkedinUrl: string | null;
}

export interface CoFounderProfile {
  id: string;
  userId: string;
  linkedinUrl: string;
  workInterests: string[];
  pitch: string | null;
  lookingFor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: CoFounderUser;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChatSubscription {
  id: string;
  plan: ChatPlanId;
  amountPaid: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── List ─────────────────────────────────────────────────

export function useCoFounders(options: { search?: string; workInterests?: string[]; page?: number; limit?: number }) {
  const { search, workInterests, page = 1, limit = 12 } = options;
  const [profiles, setProfiles] = useState<CoFounderProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const interestsKey = (workInterests ?? []).join(",");

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (interestsKey) params.set("workInterests", interestsKey);
      const res = await apiFetch<{ success: boolean; data: { profiles: CoFounderProfile[]; pagination: Pagination } }>(
        `/api/cofounders?${params.toString()}`
      );
      if (res.success) {
        setProfiles(res.data.profiles);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, interestsKey, page, limit]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, pagination, isLoading, error, refetch: fetchProfiles };
}

// ─── Single ───────────────────────────────────────────────

export function useCoFounder(id: string) {
  const [profile, setProfile] = useState<CoFounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch<{ success: boolean; data: { profile: CoFounderProfile } }>(`/api/cofounders/${id}`);
        if (!cancelled && res.success) setProfile(res.data.profile);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Profile not found");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { profile, isLoading, error };
}

// ─── Own profile ──────────────────────────────────────────

export function useMyCoFounderProfile() {
  const [profile, setProfile] = useState<CoFounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: { profile: CoFounderProfile | null } }>("/api/cofounders/me");
      if (res.success) setProfile(res.data.profile);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const save = useCallback(
    async (input: { linkedinUrl: string; workInterests: string[]; pitch?: string; lookingFor?: string; isActive?: boolean }) => {
      const res = await apiFetch<{ success: boolean; data: { profile: CoFounderProfile } }>("/api/cofounders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.success) setProfile(res.data.profile);
      return res.data.profile;
    },
    []
  );

  return { profile, isLoading, refetch, save };
}

// ─── Chat subscription ────────────────────────────────────

export function useChatSubscription() {
  const [subscription, setSubscription] = useState<ChatSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { hasActiveSubscription: boolean; subscription: ChatSubscription | null };
      }>("/api/chat-subscriptions/status");
      if (res.success) setSubscription(res.data.subscription);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const subscribe = useCallback(
    async (plan: ChatPlanId) => {
      await apiFetch("/api/chat-subscriptions/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      await refetch();
    },
    [refetch]
  );

  return { subscription, hasActive: !!subscription, isLoading, refetch, subscribe };
}
