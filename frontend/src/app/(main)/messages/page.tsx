"use client";

import React, { useState } from "react";
import ChatList from "@/components/messages/chat-list";
import Conversation from "@/components/messages/conversation";
import MessageInput from "@/components/messages/message-input";

export default function MessagesPage() {
  const [active, setActive] = useState<string>("c-1");

  return (
    <main className="min-h-screen bg-[#f7efee] p-4 lg:p-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-4 rounded-[20px] lg:grid-cols-[360px_1fr]">
          <div className="rounded-[18px] border border-[#ebd5d9] bg-[#fff6f6] p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#4d0d1d]">Messages</h2>
              <div className="text-sm text-[#7a1f39]">All</div>
            </div>

            <div className="h-[640px]">
              <ChatList onSelect={setActive} activeId={active} />

              <div className="mt-4">
                <button className="w-full rounded-[12px] border border-[#ebd5d9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#4d0d1d]">
                  Need help? Contact Support
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#ebd5d9] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39]" />
                <div>
                  <div className="text-sm font-semibold text-[#3d2a32]">Ananya Sharma <span className="text-xs text-[#7a1f39]">· Online · Kolkata</span></div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#7a1f39]">
                <button>📞</button>
                <button>📹</button>
                <button>⋯</button>
              </div>
            </div>

            <div className="h-[520px]">
              <Conversation id={active} />
            </div>

            <div className="mt-4">
              <MessageInput />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
