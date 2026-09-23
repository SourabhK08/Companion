import React from "react";
import { conversations } from "@/config/messages-data";

export default function ChatList({ onSelect, activeId }: { onSelect: (id: string) => void; activeId?: string }) {
  return (
    <aside className="h-full w-full overflow-auto">
      <div className="space-y-3">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg p-3 text-left transition ${
              activeId === c.id ? "bg-[#f6e9ec]" : "hover:bg-[#fff7f7]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#d4a2ab] to-[#7a1f39] text-white flex items-center justify-center font-semibold">
                {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-[#3d2a32]">{c.name}</div>
                  <div className="text-xs text-[#8a6e74]">{c.time}</div>
                </div>
                <div className="text-xs text-[#6b4a52] truncate max-w-[220px]">{c.lastMessage}</div>
              </div>
            </div>

            {c.unread ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7a1f39] text-white text-xs font-semibold">{c.unread}</div>
            ) : null}
          </button>
        ))}
      </div>
    </aside>
  );
}
