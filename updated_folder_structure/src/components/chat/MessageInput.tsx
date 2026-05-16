import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "../ui/Button";

export function MessageInput({ onSend, onStop, isLoading }: { onSend: (msg: string) => void; onStop: () => void; isLoading: boolean }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (!input.trim() || isLoading) return; onSend(input.trim()); setInput(""); if (textareaRef.current) textareaRef.current.style.height = "auto"; };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };
  const autoResize = () => { if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`; } };
  useEffect(() => { autoResize(); }, [input]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 border-t border-border bg-surface-elevated">
      <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} placeholder="Type your message..." rows={1} className="flex-1 px-4 py-3 border border-border rounded-xl font-mono text-sm resize-none min-h-[44px] max-h-[200px] bg-background text-foreground focus:border-accent-cyan focus:shadow-neon-cyan outline-none transition-all" />
      {isLoading ? <Button variant="danger" onClick={onStop}>Stop</Button> : <Button variant="primary" disabled={!input.trim()}>Send</Button>}
    </form>
  );
}