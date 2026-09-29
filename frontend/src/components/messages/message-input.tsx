"use client";

import React, { useCallback, useRef, useState } from "react";
import { Send, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);

      // Emit typing event
      onTyping?.();

      // Clear previous timeout and set new one to stop typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 1500);
    },
    [onTyping, onStopTyping]
  );

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
    onStopTyping?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [text, disabled, onSend, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#ead5d9] bg-white px-3 py-2">
      <button
        type="button"
        className="flex size-8 items-center justify-center rounded-full text-[#7a1f39] hover:bg-[#f6e9ec] transition-colors"
        aria-label="Attach file"
      >
        <Paperclip className="size-4" />
      </button>
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-transparent outline-none text-sm text-[#3d2a32] placeholder:text-[#8a6e74] disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="flex size-9 items-center justify-center rounded-full bg-[#7a1f39] text-white transition-all hover:bg-[#5a1129] disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
