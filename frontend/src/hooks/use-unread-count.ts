"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api/client";
import { useSocket } from "@/providers/socket-provider";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { socket } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: { unreadCount: number } }>("/api/chat/unread-count");
      if (res.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    // When a new message comes in that belongs to us (and we haven't read it),
    // increment the total unread count
    const handleNewMessage = () => {
      // Because we might not know if it's currently being read in the active window
      // the safest bet is to re-fetch the accurate number from the server
      // Alternatively, we can increment optimistically. Let's re-fetch to stay perfectly synced.
      fetchUnreadCount();
    };

    // If messages are read in another tab or in the messages view, update the count
    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    socket.on("new_message_notification", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message_notification", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, fetchUnreadCount]);

  return unreadCount;
}
