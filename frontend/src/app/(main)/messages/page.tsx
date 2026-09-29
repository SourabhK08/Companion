"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/providers/socket-provider";
import { useChatList, useChat } from "@/hooks/use-chat";
import ChatList from "@/components/messages/chat-list";
import Conversation from "@/components/messages/conversation";
import MessageInput from "@/components/messages/message-input";

function MessagesContent() {
  const searchParams = useSearchParams();
  const chatParam = searchParams.get("chat");
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { conversations, isLoading: listLoading, markConversationRead } = useChatList();

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

            <div className="h-[640px]">
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
                  <MessageInput
                    onSend={sendMessage}
                    onTyping={sendTyping}
                    onStopTyping={sendStopTyping}
                  />
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex h-full min-h-[600px] flex-col items-center justify-center text-center px-8">
                <div className="flex size-20 items-center justify-center rounded-full bg-[#f6e9ec] mb-5">
                  <MessageCircle className="size-9 text-[#7a1f39]" />
                </div>
                <h3 className="text-lg font-bold text-[#4d0d1d]">
                  Your Messages
                </h3>
                <p className="mt-2 text-sm text-[#8a6e74] max-w-xs">
                  Select a conversation from the sidebar or send a message to a
                  companion from their profile page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
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
