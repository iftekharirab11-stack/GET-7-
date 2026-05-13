import { NextRequest } from "next/server";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const requestSchema = z.object({ essay: z.string().min(10), topic: z.string().optional() });

const SYSTEM_PROMPT = `You are an IELTS examiner. Score the writing strictly on IELTS criteria (Band 0-9). Return JSON only: { "score": number, "grammar_feedback": string, "vocabulary_feedback": string, "improved_version": string }`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { essay, topic } = requestSchema.parse(body);
    if (!OPENAI_API_KEY) return Response.json({ error: "OpenAI API key missing" }, { status: 500 });

    const userContent = topic ? `Topic: ${topic}\n\nEssay:\n${essay}` : `Essay:\n${essay}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userContent }], response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 2048 }),
    });
    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}