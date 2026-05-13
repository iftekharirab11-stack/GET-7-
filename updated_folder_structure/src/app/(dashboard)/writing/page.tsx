"use client";

import { useState } from "react";
import { EssayEditor } from "@/components/writing/EssayEditor";
import { FeedbackPanel } from "@/components/writing/FeedbackPanel";

export default function WritingPage() {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (essay: string, topic: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/writing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ essay, topic }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setFeedback(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-b from-[#0A0C10] to-[#0D1117]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-accent-cyan font-sans uppercase">IELTS Writing Practice</h1><p className="text-muted text-sm font-mono uppercase">Write an essay and get AI-powered IELTS feedback</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EssayEditor onSubmit={handleSubmit} isLoading={loading} />
          <FeedbackPanel feedback={feedback} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}