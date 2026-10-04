"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";
import { useChatAccess } from "@/hooks/use-chat-access";

/**
 * Handles every gate before opening a Co-Founder chat:
 *   1. Logged-in user must have their own Co-Founder profile (LinkedIn attached)
 *   2. Must hold an active Chat Pass → otherwise open the pricing modal
 *   3. Creates / reuses the conversation and navigates to /messages
 *
 * State comes from the global ChatAccessProvider, so it is always fresh — no page refresh needed.
 * The server remains the final authority: if it rejects, we resync and show the right step.
 */
export function useStartCoFounderChat() {
  const router = useRouter();
  const { user } = useAuth();
  const access = useChatAccess();
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref (not state) so the value survives the modal closing before navigation happens
  const pendingRecipientRef = useRef<string | null>(null);

  const goToProfileSetup = useCallback(() => {
    router.push("/settings?tab=cofounder&next=/explore/cofounder");
  }, [router]);

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
        if (res.success) {
          router.push(`/messages?chat=${res.data.conversation.id}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not start chat";
        if (msg.startsWith("SUBSCRIPTION_REQUIRED")) {
          await access.refresh();
          pendingRecipientRef.current = recipientUserId;
          setPassModalOpen(true);
        } else if (msg.startsWith("COFOUNDER_PROFILE_REQUIRED")) {
          await access.refresh();
          goToProfileSetup();
        } else {
          setError(msg);
        }
      } finally {
        setIsStarting(false);
      }
    },
    [router, access, goToProfileSetup]
  );

  const startChat = useCallback(
    async (recipientUserId: string) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (recipientUserId === user.id) return;

      if (!access.hasProfile) {
        goToProfileSetup();
        return;
      }
      if (!access.hasActivePass) {
        pendingRecipientRef.current = recipientUserId;
        setPassModalOpen(true);
        return;
      }
      await openConversation(recipientUserId);
    },
    [user, access.hasProfile, access.hasActivePass, router, goToProfileSetup, openConversation]
  );

  /** After successful payment, continue straight into the pending chat */
  const handlePassPurchased = useCallback(() => {
    const id = pendingRecipientRef.current;
    pendingRecipientRef.current = null;
    setPassModalOpen(false);
    if (id) void openConversation(id);
  }, [openConversation]);

  const closePassModal = useCallback(() => {
    setPassModalOpen(false);
    pendingRecipientRef.current = null;
  }, []);

  return {
    startChat,
    isStarting,
    error,
    clearError: () => setError(null),
    hasProfile: access.hasProfile,
    subscription: access.subscription,
    hasActivePass: access.hasActivePass,
    subscribe: access.subscribe,
    passModalOpen,
    openPassModal: () => setPassModalOpen(true),
    closePassModal,
    handlePassPurchased,
  };
}
