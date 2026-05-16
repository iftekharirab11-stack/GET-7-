import { useState } from "react";
import { Button } from "../ui/Button";

const TOPICS = ["Describe your favorite place", "The most memorable day of my life", "Why learn a new language", "My dream career", "A book that changed my perspective", "Custom topic..."];

export function EssayEditor({ onSubmit, isLoading }: { onSubmit: (essay: string, topic: string) => void; isLoading: boolean }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [essay, setEssay] = useState("");

  const handleSubmit = () => { onSubmit(essay, topic === "Custom topic..." ? customTopic : topic); };
  const clear = () => { setEssay(""); };

  return (
    <div className="card flex flex-col h-full">
      <div className="p-4 border-b border-border bg-surface-elevated"><label className="block text-sm font-semibold text-foreground mb-2 font-mono uppercase">Essay Topic</label><select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-2 border border-border rounded-md bg-background text-foreground font-mono text-sm mb-2"><option>Select topic</option>{TOPICS.map(t => <option key={t}>{t}</option>)}</select>{topic === "Custom topic..." && <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Enter your topic..." className="w-full p-2 border border-border rounded-md bg-background text-foreground font-mono text-sm" />}</div>
      <textarea value={essay} onChange={(e) => setEssay(e.target.value)} disabled={isLoading} placeholder="Write your essay here (250+ words for best results)..." className="w-full min-h-[350px] p-4 font-mono text-sm bg-background text-foreground resize-y outline-none focus:bg-surface" />
      <div className="p-4 border-t border-border flex justify-end gap-3"><Button variant="secondary" onClick={clear} disabled={isLoading}>Clear</Button><Button variant="primary" onClick={handleSubmit} disabled={isLoading || !essay.trim()}>{isLoading ? "Analyzing..." : "Submit for Review"}</Button></div>
    </div>
  );
}