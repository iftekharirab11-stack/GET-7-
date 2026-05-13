import { rateLimit } from "@/lib/api/rateLimit";
import { NextRequest } from "next/server";

export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(messages: any[], temperature: number, maxTokens: number) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature, max_tokens: maxTokens, stream: true }),
  });
  return response;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await rateLimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });

  try {
    const { messages, provider = "openai", temperature = 0.7, max_tokens = 2048 } = await request.json();
    if (!messages?.length) throw new Error("Messages required");

    let response: Response;
    if (provider === "openai") response = await callOpenAI(messages, temperature, max_tokens);
    else throw new Error(`Provider ${provider} not supported`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              } catch {}
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (error: any) {
    return new Response(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`), { status: 500 });
  }
}