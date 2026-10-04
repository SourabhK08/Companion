"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/providers/socket-provider";
import type { ConversationSummary } from "@/hooks/use-chat";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString("en-IN", { weekday: "short" });
  }
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

interface ChatListProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export default function ChatList({ conversations, activeId, onSelect, isLoading }: ChatListProps) {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  if (isLoading) {
    return (
      <aside className="h-full w-full overflow-auto">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[#f0dfe3]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-[#f0dfe3]" />
                <div className="h-2.5 w-40 animate-pulse rounded bg-[#f0dfe3]" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (conversations.length === 0) {
    return (
      <aside className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-[#4d0d1d]">No conversations yet</p>
          <p className="mt-1 text-xs text-[#8a6e74]">
            Explore co-founders &amp; partners and tap “Chat” on any profile to start a conversation.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full w-full overflow-auto">
      <div className="space-y-1">
        {conversations.map((conv) => {
          // Determine the "other" user
          const otherUser =
            conv.user1.id === user?.id ? conv.user2 : conv.user1;
          const isOnline = onlineUsers.has(otherUser.id);

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition ${
                activeId === conv.id
                  ? "bg-[#f6e9ec] border border-[#ebd5d9]"
                  : "hover:bg-[#fff7f7]"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] text-sm font-semibold text-white">
                    {getInitials(otherUser.fullName)}
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  )}
                </div>

                <div className="flex min-w-0 flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#3d2a32] truncate max-w-[140px]">
                      {otherUser.fullName}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#8a6e74]">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <span className="text-xs text-[#6b4a52] truncate max-w-[200px]">
                    {conv.lastMessage
                      ? conv.lastMessage.senderId === user?.id
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content
                      : "Start a conversation"}
                  </span>
                </div>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7a1f39] px-1.5 text-[10px] font-bold text-white">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
