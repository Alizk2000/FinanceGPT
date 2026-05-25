"use client";

import { useEffect, useState } from "react";

type ConversationEntry = {
  id: number;
  session_id: string;
  question: string;
  answer: string;
  sources: string[];
  timestamp: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/history")
      .then((r) => r.json())
      .then((data) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h1 className="text-xl font-semibold text-white mb-6">
        Conversation History
      </h1>

      {loading && (
        <p className="text-gray-500">Loading...</p>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center text-gray-600 mt-16">
          <p className="text-4xl mb-4">📭</p>
          <p>No conversations yet. Start chatting!</p>
        </div>
      )}

      <div className="space-y-4 max-w-3xl">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-900 rounded-xl border border-gray-800 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-blue-400">
                {entry.question}
              </p>
              <span className="text-xs text-gray-600 ml-4 flex-shrink-0">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {entry.answer}
            </p>
            {entry.sources.length > 0 && (
              <div className="mt-3 flex gap-1 flex-wrap">
                {entry.sources.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
                  >
                    📎 {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
