"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Megaphone,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";

/* ─── Icon Mapping ─── */

const typeIconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  WALLET: { icon: Wallet, bg: "bg-emerald-100", color: "text-emerald-600" },
  BOOKING: { icon: CalendarCheck, bg: "bg-sky-100", color: "text-sky-600" },
  MEETING: { icon: Play, bg: "bg-purple-100", color: "text-purple-600" },
  SYSTEM: { icon: ShieldCheck, bg: "bg-amber-100", color: "text-amber-600" },
  PROMO: { icon: Megaphone, bg: "bg-berry/10", color: "text-berry" },
};

/* ─── Notification Type Tabs ─── */

const tabs = [
  { key: "all", label: "All" },
  { key: "BOOKING", label: "Bookings" },
  { key: "WALLET", label: "Wallet" },
  { key: "MEETING", label: "Meetings" },
  { key: "PROMO", label: "Offers" },
];

/* ─── Time Ago Helper ─── */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Notification Item ─── */

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  const config = typeIconMap[notification.type] || typeIconMap.SYSTEM;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
        notification.isRead
          ? "bg-white hover:bg-muted/50"
          : "bg-berry/[0.03] hover:bg-berry/[0.06]"
      )}
    >
      {/* Icon */}
      <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("size-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-sm leading-tight",
              notification.isRead ? "font-medium text-foreground" : "font-bold text-foreground"
            )}
          >
            {notification.title}
          </h3>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {notification.body}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="mt-2 size-2 shrink-0 rounded-full bg-berry" />
      )}
    </button>
  );
}

/* ─── Page ─── */

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(page);

  // Filter by tab (client-side since we fetch all types)
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  return (
    <main className="min-h-screen bg-[#f7efee] p-4 lg:p-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-[22px] border border-[#ebd5d9] bg-white p-4 shadow-sm sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-bold text-[#4d0d1d]">Notifications</h1>
              <p className="text-[13px] text-[#6f4d54]">
                Stay updated with your bookings, wallet, meetings, and important activities.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="shrink-0 rounded-full border border-[#ebd5d9] bg-[#f9ebee] px-3 py-2 text-sm font-semibold text-[#7a1f39] hover:bg-[#f0dbe0] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-[#f1dfe4] pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-[#7a1f39] text-white"
                    : "text-[#6f4d54] hover:bg-[#f9ebee]"
                )}
              >
                {tab.label}
                {tab.key === "all" && unreadCount > 0 && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="mt-3 divide-y divide-[#f1dfe4]">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="size-8 animate-spin rounded-full border-4 border-[#f0dfe3] border-t-[#7a1f39]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="size-12 text-muted-foreground/20" />
                <h3 className="mt-4 text-lg font-bold text-foreground">No notifications</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeTab === "all"
                    ? "You're all caught up! New activity will appear here."
                    : `No ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} notifications yet.`}
                </p>
              </div>
            ) : (
              filtered.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3 border-t border-[#f1dfe4] pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 rounded-lg text-xs border-[#ebd5d9]"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
                className="h-8 rounded-lg text-xs border-[#ebd5d9]"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
