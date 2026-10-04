"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ArrowLeft, ArrowRight, Briefcase, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/providers/socket-provider";
import { useChatList, useChat } from "@/hooks/use-chat";
import { useChatAccess } from "@/hooks/use-chat-access";
import { ChatPassModal } from "@/components/cofounders/chat-pass-modal";
import ChatList from "@/components/messages/chat-list";
import Conversation from "@/components/messages/conversation";
import MessageInput from "@/components/messages/message-input";

function MessagesContent() {
  const searchParams = useSearchParams();
  const chatParam = searchParams.get("chat");
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();
  const { conversations, isLoading: listLoading, markConversationRead, refetch } = useChatList();
  const access = useChatAccess();
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    chatParam || null
  );
  // Mobile: show chat list or conversation
  const [showConversation, setShowConversation] = useState(!!chatParam);

  // If URL has ?chat=xxx, use it
  useEffect(() => {
    if (chatParam) {
      setActiveConversationId(chatParam);
      setShowConversation(true);
    }
  }, [chatParam]);

  // A just-created conversation may not be in the list yet → refetch once (no hard refresh needed)
  const refetchedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !listLoading &&
      activeConversationId &&
      !conversations.some((c) => c.id === activeConversationId) &&
      refetchedForRef.current !== activeConversationId
    ) {
      refetchedForRef.current = activeConversationId;
      void refetch();
    }
  }, [listLoading, activeConversationId, conversations, refetch]);

  // Server rejected a message (no profile / pass expired)
  useEffect(() => {
    if (!socket) return;
    const onDenied = ({ message }: { message: string }) => {
      setAccessDenied(message.replace(/^[A-Z_]+:\s*/, ""));
    };
    socket.on("chat_access_denied", onDenied);
    return () => {
      socket.off("chat_access_denied", onDenied);
    };
  }, [socket]);

  // Clear the banner as soon as access is restored
  useEffect(() => {
    if (access.hasActivePass && access.hasProfile) setAccessDenied(null);
  }, [access.hasActivePass, access.hasProfile]);

  const {
    messages,
    isLoading: messagesLoading,
    isTyping,
    hasMore,
    sendMessage,
    sendTyping,
    sendStopTyping,
    markRead,
    loadOlderMessages,
  } = useChat(activeConversationId);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (activeConversationId) {
      markRead();
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId, markRead, markConversationRead]);

  // Find the active conversation data
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherUser = activeConversation
    ? activeConversation.user1.id === user?.id
      ? activeConversation.user2
      : activeConversation.user1
    : null;
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
  const canSend = access.hasProfile && access.hasActivePass;
  const passEnd = access.subscription
    ? new Date(access.subscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowConversation(true);
  };

  const handleBack = () => {
    setShowConversation(false);
  };

  return (
    <main className="min-h-screen bg-[#f7efee] p-4 lg:p-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-0 rounded-[20px] overflow-hidden lg:grid-cols-[360px_1fr] lg:gap-0">
          {/* ═══ LEFT PANEL — Chat List ═══ */}
          <div
            className={`rounded-l-[18px] border border-[#ebd5d9] bg-[#fff6f6] p-4 shadow-sm ${
              showConversation ? "hidden lg:block" : "block"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-[#7a1f39]" />
                <h2 className="text-[18px] font-bold text-[#4d0d1d]">Messages</h2>
              </div>
              <div className="rounded-full bg-[#f6e9ec] px-2.5 py-1 text-[10px] font-bold text-[#7a1f39]">
                {conversations.filter((c) => c.unreadCount > 0).length} unread
              </div>
            </div>

            {/* Chat Pass status */}
            <div className="mb-4 rounded-xl border border-[#ebd5d9] bg-white px-3 py-2.5">
              {!access.hasProfile ? (
                <Link href="/settings?tab=cofounder&next=/messages" className="flex items-center justify-between text-xs">
                  <span className="text-[#8a6e74]">Co-Founder profile not created</span>
                  <span className="font-semibold text-[#7a1f39]">Create →</span>
                </Link>
              ) : access.hasActivePass ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Chat Pass active
                  </span>
                  <span className="text-[#8a6e74]">till {passEnd}</span>
                </div>
              ) : (
                <button onClick={() => setPassModalOpen(true)} className="flex w-full items-center justify-between text-xs">
                  <span className="text-[#8a6e74]">No active Chat Pass</span>
                  <span className="font-semibold text-[#7a1f39]">Get from ₹9 →</span>
                </button>
              )}
            </div>

            <div className="h-[580px]">
              <ChatList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                isLoading={listLoading}
              />
            </div>
          </div>

          {/* ═══ RIGHT PANEL — Conversation ═══ */}
          <div
            className={`rounded-r-[18px] border border-l-0 border-[#ebd5d9] bg-white shadow-sm flex flex-col ${
              showConversation ? "block" : "hidden lg:flex"
            }`}
          >
            {activeConversationId && otherUser ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-[#f0e4e7] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Back button (mobile) */}
                    <button
                      onClick={handleBack}
                      className="flex size-8 items-center justify-center rounded-full hover:bg-[#f6e9ec] lg:hidden"
                    >
                      <ArrowLeft className="size-4 text-[#7a1f39]" />
                    </button>

                    {/* Avatar */}
                    <div className="relative">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] text-sm font-semibold text-white">
                        {otherUser.fullName
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      {isOtherOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[#3d2a32]">
                        {otherUser.fullName}
                      </div>
                      <div className="text-[11px] text-[#8a6e74]">
                        {isOtherOnline ? (
                          <span className="text-emerald-600">Online</span>
                        ) : (
                          "Offline"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 h-[520px]">
                  <Conversation
                    messages={messages}
                    isLoading={messagesLoading}
                    isTyping={isTyping}
                    otherUserName={otherUser.fullName}
                    hasMore={hasMore}
                    onLoadMore={loadOlderMessages}
                  />
                </div>

                {/* Input */}
                <div className="border-t border-[#f0e4e7] p-4">
                  {canSend && !accessDenied ? (
                    <MessageInput
                      onSend={sendMessage}
                      onTyping={sendTyping}
                      onStopTyping={sendStopTyping}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#ebd5d9] bg-[#fff6f6] px-4 py-3 sm:flex-row">
                      <div className="flex items-center gap-2.5 text-left">
                        <Lock className="size-4 shrink-0 text-[#7a1f39]" />
                        <p className="text-xs text-[#5d2a38]">
                          {!access.hasProfile
                            ? "Create your Co-Founder profile (LinkedIn) to send messages."
                            : accessDenied || "Your Chat Pass has expired. Renew to keep chatting — unlimited messages."}
                        </p>
                      </div>
                      {!access.hasProfile ? (
                        <Link
                          href={`/settings?tab=cofounder&next=/messages?chat=${activeConversationId}`}
                          className="shrink-0 rounded-full bg-[#4d0d1d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7a1f39]"
                        >
                          Create Profile
                        </Link>
                      ) : (
                        <button
                          onClick={() => setPassModalOpen(true)}
                          className="shrink-0 rounded-full bg-[#4d0d1d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7a1f39]"
                        >
                          Get Chat Pass · ₹9/week
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : activeConversationId && listLoading ? (
              <div className="flex h-full min-h-[600px] items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-[#7a1f39] border-t-transparent" />
              </div>
            ) : (
              /* Empty state — Co-Founder chat flow */
              <div className="flex h-full min-h-[600px] flex-col items-center justify-center px-8 text-center">
                <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-[#f6e9ec]">
                  <Briefcase className="size-9 text-[#7a1f39]" />
                </div>
                <h3 className="text-lg font-bold text-[#4d0d1d]">Co-Founder Conversations</h3>
                <p className="mt-2 max-w-sm text-sm text-[#8a6e74]">
                  Chat is reserved for the <span className="font-semibold text-[#7a1f39]">Find Your Co-Founder</span> community —
                  connect with serious builders to execute your idea.
                </p>

                {/* Step-by-step based on the user's current access */}
                <ol className="mt-6 w-full max-w-sm space-y-2.5 text-left">
                  {[
                    { done: access.hasProfile, label: "Create your Co-Founder profile & attach LinkedIn" },
                    { done: access.hasActivePass, label: "Get a Chat Pass — ₹9/week · ₹35/month · ₹100/3 months" },
                    { done: conversations.length > 0, label: "Explore profiles and tap “Chat” to start" },
                  ].map((step, i) => (
                    <li
                      key={step.label}
                      className="flex items-center gap-3 rounded-xl border border-[#f0e4e7] bg-[#fffafa] px-3 py-2.5"
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          step.done ? "bg-emerald-500 text-white" : "bg-[#f6e9ec] text-[#7a1f39]"
                        }`}
                      >
                        {step.done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                      </span>
                      <span className={`text-xs ${step.done ? "text-[#8a6e74] line-through" : "text-[#4d0d1d]"}`}>
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6">
                  {!access.hasProfile ? (
                    <Link
                      href="/settings?tab=cofounder&next=/messages"
                      className="inline-flex items-center gap-2 rounded-full bg-[#4d0d1d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7a1f39]"
                    >
                      Create Co-Founder Profile <ArrowRight className="size-4" />
                    </Link>
                  ) : !access.hasActivePass ? (
                    <button
                      onClick={() => setPassModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#4d0d1d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7a1f39]"
                    >
                      Get Chat Pass from ₹9 <ArrowRight className="size-4" />
                    </button>
                  ) : (
                    <Link
                      href="/explore/cofounder"
                      className="inline-flex items-center gap-2 rounded-full bg-[#4d0d1d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7a1f39]"
                    >
                      {conversations.length > 0 ? "Find more Co-Founders" : "Explore Co-Founders"} <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
                {conversations.length > 0 && (
                  <p className="mt-4 text-xs text-[#8a6e74]">Or select a conversation from the left.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatPassModal
        open={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        onSubscribe={access.subscribe}
        onSuccess={() => setAccessDenied(null)}
      />
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7efee]">
          <div className="animate-spin size-8 border-4 border-[#7a1f39] border-t-transparent rounded-full" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
