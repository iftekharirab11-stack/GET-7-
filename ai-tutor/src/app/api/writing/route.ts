const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const SYSTEM_PROMPT = `You are an expert writing tutor. Analyze the user's essay and provide detailed feedback on:
1. Grammar and punctuation errors
2. Vocabulary and word choice suggestions
3. Sentence structure and flow improvements
4. Overall organization and coherence
5. Specific strengths

Provide your feedback in a clear, structured format. End with an overall score out of 100.`;

export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const body = await request.json();
    const { essay, topic } = body;

    if (!essay || essay.trim().length < 10) {
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: "Please write at least 10 characters" })}\n\n`),
        { status: 400, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: topic
          ? `Topic: ${topic}\n\nEssay:\n${essay}`
          : `Essay:\n${essay}`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: errorText || `API error: ${response.status}` })}\n\n`),
        { status: response.status, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
      );
    }

    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";
        const processChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }

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
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
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