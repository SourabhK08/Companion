"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api/client";
import { useSocket } from "@/providers/socket-provider";

// ─── Types ────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  icon: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  /** Global unread count — used by the bell badge */
  unreadCount: number;
  /** Decrement count by 1 (called when one notification is read) */
  decrementCount: () => void;
  /** Set count to 0 (called when "mark all as read") */
  clearCount: () => void;
  /** Refetch count from the server */
  refetchCount: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  decrementCount: () => {},
  clearCount: () => {},
  refetchCount: () => {},
});

// ─── Provider ─────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const hasRequestedPermission = useRef(false);

  // Fetch initial count
  const refetchCount = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: { unreadCount: number } }>(
        "/api/notifications/unread-count"
      );
      if (res.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    refetchCount();
  }, [refetchCount]);

  // Request browser notification permission (once, from user context)
  useEffect(() => {
    if (hasRequestedPermission.current) return;
    hasRequestedPermission.current = true;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        // We'll request on first real notification instead (modern browsers need user gesture)
        // But try anyway — some browsers still allow it
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Listen for real-time new notifications
  useEffect(() => {
    if (!socket) return;

    const handleNew = (data: { notification: AppNotification }) => {
      setUnreadCount((prev) => prev + 1);

      // Show browser system notification
      showBrowserNotification(data.notification);
    };

    socket.on("new_notification", handleNew);
    return () => { socket.off("new_notification", handleNew); };
  }, [socket]);

  const decrementCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, decrementCount, clearCount, refetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────

/** Used by the topbar bell badge */
export function useNotificationCount() {
  return useContext(NotificationContext);
}

/** Used by the notifications page */
export function useNotifications(page: number = 1) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pagination, setPagination] = useState<{
    page: number; limit: number; total: number; totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();
  const { unreadCount, decrementCount, clearCount, refetchCount } = useContext(NotificationContext);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: {
          notifications: AppNotification[];
          unreadCount: number;
          pagination: { page: number; limit: number; total: number; totalPages: number };
        };
      }>(`/api/notifications?page=${page}&limit=20`);

      if (res.success) {
        setNotifications(res.data.notifications);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time: prepend new notifications
  useEffect(() => {
    if (!socket) return;

    const handleNew = (data: { notification: AppNotification }) => {
      setNotifications((prev) => [data.notification, ...prev]);
    };

    socket.on("new_notification", handleNew);
    return () => { socket.off("new_notification", handleNew); };
  }, [socket]);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistically update UI first
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    decrementCount(); // Immediately update bell badge

    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark as read:", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
      );
      refetchCount();
    }
  }, [decrementCount, refetchCount]);

  const markAllAsRead = useCallback(async () => {
    // Optimistically update UI first
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    clearCount(); // Immediately update bell badge to 0

    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      refetchCount();
      fetchNotifications();
    }
  }, [clearCount, refetchCount, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// ─── Browser Notification Helper ──────────────────────────

function showBrowserNotification(notification: AppNotification) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  // If permission not yet granted, request it now (user-gesture not always required for socket events)
  if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        createBrowserNotif(notification);
      }
    }).catch(() => {});
    return;
  }

  if (Notification.permission === "granted") {
    createBrowserNotif(notification);
  }
}

function createBrowserNotif(notification: AppNotification) {
  try {
    const n = new window.Notification(notification.title, {
      body: notification.body,
      icon: "/favicon.ico",
      tag: notification.id, // Prevents duplicate system notifications
      requireInteraction: false,
    });

    // Click handler: focus the window and navigate
    n.onclick = () => {
      window.focus();
      if (notification.linkUrl) {
        window.location.href = notification.linkUrl;
      }
      n.close();
    };

    // Auto-close after 6 seconds
    setTimeout(() => n.close(), 6000);
  } catch {
    // Fallback: some environments don't support Notification constructor
  }
}
