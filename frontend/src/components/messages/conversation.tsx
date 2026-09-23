import React from "react";
import { messagesByConversation } from "@/config/messages-data";

export default function Conversation({ id }: { id: string }) {
  const messages = messagesByConversation[id] || [];

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
      <div className="flex h-full flex-col gap-4 overflow-auto px-4 py-3">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[75%] ${m.senderId === "me" ? "ml-auto text-right" : "mr-auto text-left"}`}>
            {m.type === "image" ? (
              <div className="rounded-xl bg-[#fdeff1] p-2">
                <img src={m.imageUrl} alt={m.fileName || "image"} className="max-h-40 w-full rounded-md object-cover" />
                <div className="mt-2 text-xs text-[#6f4d54]">Cafe Vibes · 2.4 MB · JPG</div>
              </div>
            ) : (
              <div className={`inline-block rounded-xl px-4 py-3 ${m.senderId === "me" ? "bg-[#54162a] text-white" : "bg-[#fdeff4] text-[#3d2a32]"}`}>
                {m.text}
                <div className="mt-2 text-[10px] text-[#9b7d83]">{m.time}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end px-4 py-2">
        <div className="text-xs text-[#7a1f39]">Ananya is typing...</div>
      </div>
    </div>
  );
}
