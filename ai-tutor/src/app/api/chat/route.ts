export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  provider?: "openai" | "anthropic" | "google";
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  finish_reason?: string;
  error?: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_PROVIDER = "openai";

async function callOpenAI(messages: Message[], temperature: number, maxTokens: number): Promise<Response> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });
  return response;
}

async function callAnthropic(messages: Message[], temperature: number, maxTokens: number): Promise<Response> {
  const anthropicMessages = messages.map((m) => ({
    role: m.role === "system" ? "developer" : m.role,
    content: m.content,
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });
  return response;
}

async function callGoogle(messages: Message[], temperature: number, maxTokens: number): Promise<Response> {
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamContent?alt=sse&key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          stopSequences: [],
        },
        systemInstruction: {
          role: "system",
          parts: [{ text: messages.find((m) => m.role === "system")?.content || "" }],
        },
      }),
    }
  );
  return response;
}

export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const body: ChatRequest = await request.json();
    const { messages, provider = DEFAULT_PROVIDER, temperature = 0.7, max_tokens: maxTokens = 2048 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: "Messages array is required" })}\n\n`),
        { status: 400, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
      );
    }

    let response: Response;
    switch (provider) {
      case "anthropic":
        response = await callAnthropic(messages, temperature, maxTokens);
        break;
      case "google":
        response = await callGoogle(messages, temperature, maxTokens);
        break;
      default:
        response = await callOpenAI(messages, temperature, maxTokens);
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: errorText || `API error: ${response.status}` })}\n\n`),
        { status: response.status, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";
        let closed = false;
        const close = () => {
          if (!closed) {
            closed = true;
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        };

        const processChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              close();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (provider === "anthropic") {
                  if (data === "[DONE]") {
                    close();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.delta?.text || "";
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch {
                    // Skip invalid JSON
                  }
                } else if (provider === "google") {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch {
                    try {
                      const parts = data.split("\n").filter((l) => l.startsWith("data: "));
                      for (const p of parts) {
                        const parsed = JSON.parse(p.slice(6));
                        const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (content) {
                          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                      }
                    } catch {
                      // Skip
                    }
                  }
                } else {
                  if (data === "[DONE]") {
                    close();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || "";
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch {
                    // Skip invalid JSON
                  }
                }
              }
            }

            processChunk();
          });
        };

        processChunk();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`),
      { status: 500, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }
}