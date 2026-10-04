"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";
import { useChatSubscription } from "@/hooks/use-cofounders";

/**
 * Handles every gate before opening a Co-Founder chat:
 *   1. Logged-in user must have their own Co-Founder profile (LinkedIn attached)
 *   2. Must hold an active Chat Pass → otherwise open the pricing modal
 *   3. Creates / reuses the conversation and navigates to /messages
 */
export function useStartCoFounderChat() {
  const router = useRouter();
  const { user } = useAuth();
  const chatSub = useChatSubscription();
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openConversation = useCallback(
    async (recipientUserId: string) => {
      setIsStarting(true);
      setError(null);
      try {
        const res = await apiFetch<{ success: boolean; data: { conversation: { id: string } } }>(
          "/api/chat/conversations",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipientId: recipientUserId }),
          }
        );
        if (res.success) router.push(`/messages?chat=${res.data.conversation.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not start chat";
        if (msg.startsWith("SUBSCRIPTION_REQUIRED")) {
          setPendingRecipient(recipientUserId);
          setPassModalOpen(true);
        } else if (msg.startsWith("COFOUNDER_PROFILE_REQUIRED")) {
          router.push("/settings?tab=cofounder");
        } else {
          setError(msg);
        }
      } finally {
        setIsStarting(false);
      }
    },
    [router]
  );

  const startChat = useCallback(
    async (recipientUserId: string) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!user.isCoFounder) {
        router.push("/settings?tab=cofounder");
        return;
      }
      if (!chatSub.hasActive) {
        setPendingRecipient(recipientUserId);
        setPassModalOpen(true);
        return;
      }
      await openConversation(recipientUserId);
    },
    [user, chatSub.hasActive, router, openConversation]
  );

  /** After successful payment, continue straight into the pending chat */
  const handlePassPurchased = useCallback(() => {
    if (pendingRecipient) {
      const id = pendingRecipient;
      setPendingRecipient(null);
      void openConversation(id);
    }
  }, [pendingRecipient, openConversation]);

  return {
    startChat,
    isStarting,
    error,
    subscription: chatSub.subscription,
    hasActivePass: chatSub.hasActive,
    subscribe: chatSub.subscribe,
    passModalOpen,
    openPassModal: () => setPassModalOpen(true),
    closePassModal: () => {
      setPassModalOpen(false);
      setPendingRecipient(null);
    },
    handlePassPurchased,
  };
}
