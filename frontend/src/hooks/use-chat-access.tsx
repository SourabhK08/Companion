"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/providers/socket-provider";
import type { ChatPlanId } from "@/config/cofounder-data";
import type { ChatSubscription } from "@/hooks/use-cofounders";

/**
 * Global, single source of truth for Co-Founder chat access.
 *
 *   hasProfile     → user has created a Co-Founder profile (LinkedIn attached)
 *   subscription   → current active Chat Pass (or null)
 *
 * Every screen (explore, profile detail, messages, settings) reads from here, and every
 * mutation (save profile, buy pass) updates it — so the UI reacts instantly with no refresh.
 */

interface ChatAccessValue {
  isLoading: boolean;
  hasProfile: boolean;
  subscription: ChatSubscription | null;
  hasActivePass: boolean;
  refresh: () => Promise<{ hasProfile: boolean; hasActivePass: boolean }>;
  subscribe: (plan: ChatPlanId) => Promise<void>;
  /** Optimistically mark profile as created (called right after a successful save) */
  markProfileCreated: () => void;
}

const ChatAccessContext = createContext<ChatAccessValue | null>(null);

export function ChatAccessProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { socket } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [subscription, setSubscription] = useState<ChatSubscription | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { hasCoFounderProfile: boolean; hasActiveSubscription: boolean; subscription: ChatSubscription | null };
      }>("/api/chat-subscriptions/status");
      if (res.success) {
        setHasProfile(res.data.hasCoFounderProfile);
        setSubscription(res.data.subscription);
        return { hasProfile: res.data.hasCoFounderProfile, hasActivePass: res.data.hasActiveSubscription };
      }
    } catch {
      // not logged in / network — treat as no access
    } finally {
      setIsLoading(false);
    }
    return { hasProfile: false, hasActivePass: false };
  }, []);

  // Load whenever the logged-in user changes
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setHasProfile(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [authLoading, isAuthenticated, user?.id, refresh]);

  // Auto-expire the pass in the UI the moment its endDate passes
  useEffect(() => {
    if (!subscription) return;
    const ms = new Date(subscription.endDate).getTime() - Date.now();
    if (ms <= 0) {
      setSubscription(null);
      return;
    }
    // setTimeout max is ~24.8 days; re-check daily for long passes
    const t = setTimeout(() => void refresh(), Math.min(ms + 1000, 24 * 60 * 60 * 1000));
    return () => clearTimeout(t);
  }, [subscription, refresh]);

  // If the server rejects a message because the pass expired, resync immediately
  useEffect(() => {
    if (!socket) return;
    const onDenied = () => void refresh();
    socket.on("chat_access_denied", onDenied);
    return () => {
      socket.off("chat_access_denied", onDenied);
    };
  }, [socket, refresh]);

  const subscribe = useCallback(
    async (plan: ChatPlanId) => {
      const res = await apiFetch<{ success: boolean; data: { subscription: ChatSubscription } }>(
        "/api/chat-subscriptions/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        }
      );
      // Optimistic update so the very next click works, then confirm with server
      if (res.success) setSubscription(res.data.subscription);
      await refresh();
    },
    [refresh]
  );

  const markProfileCreated = useCallback(() => {
    setHasProfile(true);
    void refreshUser(); // keep auth user (isCoFounder / linkedinUrl) in sync too
  }, [refreshUser]);

  const value = useMemo<ChatAccessValue>(
    () => ({
      isLoading,
      hasProfile,
      subscription,
      hasActivePass: !!subscription && new Date(subscription.endDate).getTime() > Date.now(),
      refresh,
      subscribe,
      markProfileCreated,
    }),
    [isLoading, hasProfile, subscription, refresh, subscribe, markProfileCreated]
  );

  return <ChatAccessContext.Provider value={value}>{children}</ChatAccessContext.Provider>;
}

export function useChatAccess(): ChatAccessValue {
  const ctx = useContext(ChatAccessContext);
  if (!ctx) throw new Error("useChatAccess must be used inside <ChatAccessProvider>");
  return ctx;
}
