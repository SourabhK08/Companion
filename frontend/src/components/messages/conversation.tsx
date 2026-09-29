"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/hooks/use-chat";

function formatMessageTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

interface ConversationProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  otherUserName: string;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function Conversation({
  messages,
  isLoading,
  isTyping,
  otherUserName,
  hasMore,
  onLoadMore,
}: ConversationProps) {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Infinite scroll: load older messages when scrolling to top
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      if (container.scrollTop < 60) {
        onLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, onLoadMore]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin size-8 border-4 border-[#7a1f39] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#f6e9ec] mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm font-semibold text-[#4d0d1d]">
          Start your conversation
        </p>
        <p className="mt-1 text-xs text-[#8a6e74]">
          Say hello to {otherUserName}!
        </p>
      </div>
    );
  }

  // Group messages by date
  let lastDate = "";

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full flex-col gap-1 overflow-auto px-4 py-3"
    >
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="mx-auto mb-2 text-xs font-medium text-[#7a1f39] hover:underline"
        >
          Load older messages
        </button>
      )}

      {messages.map((m) => {
        const isMe = m.senderId === user?.id;
        const msgDate = new Date(m.createdAt).toDateString();
        let showDateSep = false;
        if (msgDate !== lastDate) {
          showDateSep = true;
          lastDate = msgDate;
        }

        return (
          <React.Fragment key={m.id}>
            {showDateSep && (
              <div className="flex items-center justify-center my-3">
                <span className="rounded-full bg-[#f0e4e7] px-3 py-1 text-[10px] font-medium text-[#6d4c56]">
                  {formatDateSeparator(m.createdAt)}
                </span>
              </div>
            )}
            <div
              className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-[#54162a] text-white rounded-br-md"
                    : "bg-[#fdeff4] text-[#3d2a32] rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {m.content}
                </p>
                <div
                  className={`mt-1 flex items-center gap-1 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isMe ? "text-white/60" : "text-[#9b7d83]"
                    }`}
                  >
                    {formatMessageTime(m.createdAt)}
                  </span>
                  {isMe && (
                    m.isRead ? (
                      <CheckCheck className="size-3 text-sky-300" />
                    ) : (
                      <Check className="size-3 text-white/50" />
                    )
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start mb-1">
          <div className="rounded-2xl rounded-bl-md bg-[#fdeff4] px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="inline-block size-2 animate-bounce rounded-full bg-[#7a1f39]/40 [animation-delay:0ms]" />
              <span className="inline-block size-2 animate-bounce rounded-full bg-[#7a1f39]/40 [animation-delay:150ms]" />
              <span className="inline-block size-2 animate-bounce rounded-full bg-[#7a1f39]/40 [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
