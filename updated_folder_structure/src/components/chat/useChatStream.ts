import { useState, useCallback, useRef } from "react";

interface Message { id: string; role: "user" | "assistant"; content: string; }

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingContent("");
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    abortRef.current = new AbortController();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], provider: "openai", temperature: 0.7, max_tokens: 2048 }),
        signal: abortRef.current.signal,
      });
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let fullContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + "\n\n*[Generation stopped]*" } : m));
      } else {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Error: ${err.message}` }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  }, [messages]);

  const stopGeneration = useCallback(() => abortRef.current?.abort(), []);
  return { messages, isLoading, streamingContent, sendMessage, stopGeneration };
}