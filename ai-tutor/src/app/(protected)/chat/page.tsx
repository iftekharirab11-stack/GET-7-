"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import styles from "./page.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI tutor. What would you like to practice today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    const conversationMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userMessage.content },
    ];

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          provider: "openai",
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setStreamingContent(assistantContent);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setStreamingContent((prev) => {
          if (prev) {
            setMessages((msgs) =>
              msgs.map((m) =>
                m.id === (Date.now() + 1).toString()
                  ? { ...m, content: prev + "\n\n*[Generation stopped]*" }
                  : m
              )
            );
          }
          return prev;
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Sorry, an error occurred: ${errorMessage}`,
          },
        ]);
      }
    } finally {
      setLoading(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>AI Chat</h1>
          <p className={styles.subtitle}>
            Practice conversational skills with our AI tutor
          </p>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.messages} ref={messagesContainerRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
            {streamingContent && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageContent}>
                  {streamingContent}
                  <span className={styles.cursor}>▊</span>
                </div>
              </div>
            )}
            {loading && !streamingContent && (
              <div className={styles.loadingIndicator}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            {loading ? (
              <button
                type="button"
                className={styles.stopButton}
                onClick={handleStop}
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!input.trim()}
              >
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}