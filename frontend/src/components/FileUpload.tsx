"use client";

import { useState, DragEvent, ChangeEvent } from "react";

type Props = {
  onUpload: (file: File) => Promise<void>;
};

export default function FileUpload({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError("");
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError("Upload failed. Make sure the backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-lg">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 hover:border-gray-600 bg-gray-900"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-5xl mb-4">
            {isUploading ? "⏳" : "📄"}
          </div>
          <p className="text-white font-medium mb-2">
            {isUploading
              ? "Processing document..."
              : "Drop your financial PDF here"}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Annual reports, earnings statements, budget plans
          </p>
          {!isUploading && (
            <span className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
              Browse file
            </span>
          )}
        </label>
      </div>

      {error && (
        <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: "🔍", label: "RAG-powered", desc: "Retrieves exact context" },
          { icon: "⚡", label: "Streaming", desc: "Real-time token output" },
          { icon: "📎", label: "Source cited", desc: "Shows page references" },
        ].map((f) => (
          <div key={f.label} className="bg-gray-900 rounded-xl p-3">
            <div className="text-xl mb-1">{f.icon}</div>
            <p className="text-xs font-medium text-white">{f.label}</p>
            <p className="text-xs text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
