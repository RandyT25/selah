import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";
import type { AIMessage } from "@/types/app";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await request.json() as { messages: AIMessage[] };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured. Add GEMINI_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  // Convert messages to Gemini native format (role: user | model)
  const contents = messages
    .filter((m) => m.content && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: AI_SYSTEM_PROMPTS.bibleAssistant }],
    },
    generationConfig: {
      temperature: 0.7,
    },
  };

  // Use Gemini native streaming endpoint
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    console.error("[AI route] Gemini error", response.status, err);
    return NextResponse.json({ error: "AI request failed", detail: err }, { status: response.status });
  }

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
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          } catch {
            // skip malformed lines
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
