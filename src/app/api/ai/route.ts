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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured. Add OPENAI_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  const systemMessage = {
    role: "system" as const,
    content: AI_SYSTEM_PROMPTS.bibleAssistant,
  };

  const allMessages = [
    systemMessage,
    ...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: response.status });
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
          const data = line.slice(6);
          if (data === "[DONE]") { controller.close(); return; }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
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
