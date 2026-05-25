import type { Message } from "@/app/chat/page";

export default function ChatWindow({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.length === 0 && (
        <div className="text-center text-gray-600 mt-16">
          <p className="text-4xl mb-4">💬</p>
          <p>Ask a question about your document</p>
        </div>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-gray-800 text-gray-100 rounded-bl-sm"
            }`}
          >
            <p className={msg.isStreaming ? "cursor-blink" : ""}>
              {msg.content || (msg.isStreaming ? "" : "...")}
            </p>

            {/* Source citations */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  📎 Sources:{" "}
                  {msg.sources.map((s, i) => (
                    <span
                      key={i}
                      className="inline-block bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs mr-1"
                    >
                      {s}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
