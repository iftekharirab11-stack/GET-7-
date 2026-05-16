"use client";

import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChatStream } from "@/components/chat/useChatStream";

export default function ChatPage() {
  const { messages, isLoading, streamingContent, sendMessage, stopGeneration } = useChatStream();

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 flex flex-col bg-gradient-to-b from-[#0A0C10] to-[#0D1117]">
      <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
        <div className="mb-4"><h1 className="text-2xl font-bold text-accent-cyan font-sans uppercase tracking-wide">AI Chat</h1><p className="text-muted text-sm font-mono uppercase">Practice conversational skills with our AI tutor</p></div>
        <div className="card flex flex-col flex-1 min-h-0 overflow-hidden">
          <MessageList messages={messages} streamingContent={streamingContent} isLoading={isLoading} />
          <MessageInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}