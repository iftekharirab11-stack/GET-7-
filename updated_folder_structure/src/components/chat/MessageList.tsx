import { useEffect, useRef } from "react";

interface Message { id: string; role: "user" | "assistant"; content: string; }

export function MessageList({ messages, streamingContent, isLoading }: { messages: Message[]; streamingContent: string; isLoading: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`max-w-[85%] p-3 rounded-xl font-mono text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-accent-cyan text-black self-end rounded-br-sm ml-auto" : "bg-surface-elevated text-foreground border border-border self-start rounded-bl-sm"}`}>{m.content}</div>
      ))}
      {streamingContent && (<div className="max-w-[85%] p-3 rounded-xl bg-surface-elevated border border-border self-start rounded-bl-sm"><span>{streamingContent}</span><span className="inline-block w-2 h-4 bg-accent-cyan animate-pulse ml-1 align-middle"></span></div>)}
      {isLoading && !streamingContent && (<div className="flex gap-1 p-3 self-start"><span className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce"></span></div>)}
      <div ref={endRef} />
    </div>
  );
}