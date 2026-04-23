const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const SYSTEM_PROMPT = `You are an IELTS examiner. Score the writing strictly on IELTS criteria (Band 0-9).
Evaluate:
- Grammar (25%)
- Vocabulary (25%)
- Coherence & Cohesion (25%)
- Task Achievement (25%)

Return JSON only, no other text:
{
  "score": <number 0-9>,
  "grammar_feedback": "<2-3 sentences on grammar issues>",
  "vocabulary_feedback": "<2-3 sentences on vocabulary usage>",
  "improved_version": "<improved essay in 2-3 paragraphs>"
}`;

export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { essay, topic } = body;

    if (!essay || essay.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please write at least 10 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const userContent = topic
      ? `Topic: ${topic}\n\nEssay to evaluate:\n${essay}`
      : `Essay to evaluate:\n${essay}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: errorText || `API error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        score: 5,
        grammar_feedback: "Could not parse response",
        vocabulary_feedback: content.substring(0, 200),
        improved_version: essay,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}