"use client";

import { useState, KeyboardEvent } from "react";

type Props = {
  onSend: (question: string) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-gray-800 bg-gray-950">
      <div className="flex items-end gap-3 bg-gray-800 rounded-2xl px-4 py-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            disabled
              ? "Generating answer..."
              : "Ask a question about your document..."
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex-shrink-0"
        >
          {disabled ? "..." : "Send"}
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
