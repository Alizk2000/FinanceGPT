"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import FileUpload from "@/components/FileUpload";
import ChatInput from "@/components/ChatInput";
import ChatWindow from "@/components/ChatWindow";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isStreaming?: boolean;
};

export default function ChatPage() {
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setDocumentLoaded(true);
      setDocumentName(file.name);
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: `Document **${file.name}** loaded successfully. Ask me anything about it.`,
        },
      ]);
    }
  };

  const handleAsk = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { id: uuidv4(), role: "user", content: question };
    const assistantMsg: Message = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, session_id: sessionId }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = "";
      let sources: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.token) {
            fullAnswer += data.token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: fullAnswer, isStreaming: true }
                  : m
              )
            );
          }
          if (data.sources) {
            sources = data.sources;
          }
          if (data.done) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: fullAnswer, sources, isStreaming: false }
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: "Something went wrong. Please try again.",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div>
          <h1 className="text-lg font-semibold text-white">FinanceGPT</h1>
          {documentLoaded && (
            <p className="text-xs text-green-400 mt-0.5">
              📄 {documentName}
            </p>
          )}
        </div>
        {!documentLoaded && (
          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
            Upload a document to start
          </span>
        )}
      </div>

      {/* Upload or Chat */}
      {!documentLoaded ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <FileUpload onUpload={handleUpload} />
        </div>
      ) : (
        <>
          <ChatWindow messages={messages} />
          <div ref={bottomRef} />
          <ChatInput onSend={handleAsk} disabled={isLoading} />
        </>
      )}
    </div>
  );
}
