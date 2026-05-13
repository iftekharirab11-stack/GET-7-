"use client";

import { useState } from "react";
import { AudioRecorder } from "@/components/speaking/AudioRecorder";
import { WaveformVisualizer } from "@/components/speaking/WaveformVisualizer";

export default function SpeakingPage() {
  const [feedback, setFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAudioUpload = async (blob: Blob) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    try {
      const res = await fetch("/api/speaking", { method: "POST", body: formData });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-b from-[#0A0C10] to-[#0D1117]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-accent-cyan font-sans uppercase">Speaking Practice</h1><p className="text-muted text-sm font-mono uppercase">IELTS Speaking Mastery Interface</p></div>
        <div className="space-y-6">
          <div className="card"><h3 className="text-sm text-muted font-mono uppercase mb-2">SPEAKING PROMPT // IELTS PART 2</h3><p className="font-mono">Describe your favorite travel destination and why you would recommend it to others.</p></div>
          <div className="card flex flex-col items-center py-8"><AudioRecorder onAudioReady={handleAudioUpload} /><WaveformVisualizer isActive={isAnalyzing} /></div>
          {feedback && (<div className="card"><h3 className="text-lg font-bold text-accent-cyan mb-4">ANALYSIS // NEURAL FEEDBACK</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><span className="text-xs text-muted font-mono uppercase">Pronunciation</span><strong className="block text-xl text-accent-cyan">{feedback.pronunciation || "85%"}</strong></div><div><span className="text-xs text-muted font-mono uppercase">Fluency</span><strong className="block text-xl text-accent-cyan">{feedback.fluency || "78%"}</strong></div><div><span className="text-xs text-muted font-mono uppercase">Grammar</span><strong className="block text-xl text-accent-cyan">{feedback.grammar || "82%"}</strong></div><div><span className="text-xs text-muted font-mono uppercase">Vocabulary</span><strong className="block text-xl text-accent-cyan">{feedback.vocabulary || "90%"}</strong></div></div><div><h4 className="text-sm font-semibold text-foreground uppercase mb-1">AI RECOMMENDATIONS</h4><ul className="text-sm text-muted font-mono pl-5"><li>Work on linking words more smoothly</li><li>Try to reduce pauses between sentences</li></ul></div></div>)}
        </div>
      </div>
    </div>
  );
}