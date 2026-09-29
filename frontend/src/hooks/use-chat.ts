"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/providers/socket-provider";
import { apiFetch } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatar: string | null;
  };
}

export interface ConversationSummary {
  id: string;
  participant1: string;
  participant2: string;
  user1: { id: string; fullName: string; avatar: string | null };
  user2: { id: string; fullName: string; avatar: string | null };
  lastMessage: ChatMessage | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

// ─── useChatList — conversation list with real-time updates ─

export function useChatList() {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { conversations: ConversationSummary[] };
      }>("/api/chat/conversations");
      if (res.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time: when a new message comes in for any conversation,
  // update the chat list (move convo to top, update preview, increment unread)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({
      message,
      conversationId,
    }: {
      message: ChatMessage;
      conversationId: string;
    }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          // New conversation — refetch
          fetchConversations();
          return prev;
        }

        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.lastMessage = message;
        conv.lastMessageAt = message.createdAt;
        conv.unreadCount = conv.unreadCount + 1;
        updated.splice(idx, 1);
        updated.unshift(conv); // move to top
        return updated;
      });
    };

    socket.on("new_message_notification", handleNewMessage);

    return () => {
      socket.off("new_message_notification", handleNewMessage);
    };
  }, [socket, fetchConversations]);

  // Mark conversation as read locally (called when user opens a conversation)
  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  return { conversations, isLoading, refetch: fetchConversations, markConversationRead };
}

// ─── useChat — messages for a single conversation ─────────

export function useChat(conversationId: string | null) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { messages: ChatMessage[]; hasMore: boolean; nextCursor?: string };
      }>(`/api/chat/conversations/${conversationId}/messages`);
      if (res.success) {
        setMessages(res.data.messages);
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Load older messages (for infinite scroll upward)
  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !hasMore || !nextCursor) return;
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { messages: ChatMessage[]; hasMore: boolean; nextCursor?: string };
      }>(`/api/chat/conversations/${conversationId}/messages?cursor=${nextCursor}`);
      if (res.success) {
        setMessages((prev) => [...res.data.messages, ...prev]);
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load older messages", err);
    }
  }, [conversationId, hasMore, nextCursor]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Join conversation room on mount
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", { conversationId });

    return () => {
      socket.emit("leave_conversation", { conversationId });
    };
  }, [socket, conversationId]);

  // Listen for new messages in this conversation
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = ({
      message,
      conversationId: convId,
    }: {
      message: ChatMessage;
      conversationId: string;
    }) => {
      if (convId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleTypingStart = ({
      conversationId: convId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (convId === conversationId) {
        setIsTyping(true);
        // Auto-clear typing after 3 seconds (in case stop_typing is missed)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleTypingStop = ({
      conversationId: convId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (convId === conversationId) {
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleMessagesRead = ({
      conversationId: convId,
    }: {
      conversationId: string;
      readBy: string;
    }) => {
      if (convId === conversationId) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, conversationId]);

  // Send message
  const sendMessage = useCallback(
    (content: string, type: string = "text") => {
      if (!socket || !conversationId || !content.trim()) return;
      socket.emit("send_message", { conversationId, content: content.trim(), type });
    },
    [socket, conversationId]
  );

  // Typing indicators
  const sendTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit("typing", { conversationId });
  }, [socket, conversationId]);

  const sendStopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit("stop_typing", { conversationId });
  }, [socket, conversationId]);

  // Mark as read
  const markRead = useCallback(() => {
    if (!socket || !conversationId) return;
    socket.emit("mark_read", { conversationId });
  }, [socket, conversationId]);

  return {
    messages,
    isLoading,
    hasMore,
    isTyping,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markRead,
    loadOlderMessages,
  };
}
