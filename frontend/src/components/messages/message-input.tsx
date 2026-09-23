"use client";

import React, { useState } from "react";

export default function MessageInput({ onSend }: { onSend?: (text: string) => void }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#ead5d9] bg-white px-3 py-2">
      <button className="text-[#7a1f39]">📎</button>
      <button className="text-[#7a1f39]">🖼️</button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-transparent outline-none text-sm text-[#3d2a32]"
      />
      <button onClick={send} className="ml-2 rounded-full bg-[#7a1f39] px-3 py-2 text-white">
        ➤
      </button>
    </div>
  );
}
