import { z } from "zod";

export const chatRequestSchema = z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })), provider: z.enum(["openai", "anthropic", "google"]).optional(), temperature: z.number().min(0).max(2).optional(), max_tokens: z.number().min(1).max(4096).optional() });
export const writingRequestSchema = z.object({ essay: z.string().min(10), topic: z.string().optional() });