import { NextResponse } from "next/server";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";
import { AI_SYSTEM_PROMPTS } from "@/lib/ai/provider";
import type { AIMessage } from "@/types/app";

const FREE_DAILY_LIMIT = 10;

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

  // Check subscription plan
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = (sub?.plan === "premium" || sub?.plan === "annual") && sub?.status === "active";

  // Rate limiting — free users only
  if (!isPremium) {
    const rawAdmin = createRawAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: usageRow } = await rawAdmin
      .from("ai_usage")
      .select("query_count")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    const currentCount = usageRow?.query_count ?? 0;

    if (currentCount >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Daily limit reached", code: "RATE_LIMITED", limit: FREE_DAILY_LIMIT },
        { status: 429 }
      );
    }

    // Increment counter (upsert so it works on first use each day)
    await rawAdmin.from("ai_usage").upsert({
      user_id:     user.id,
      date:        today,
      query_count: currentCount + 1,
      token_count: 0,
    }, { onConflict: "user_id,date" }).select();
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[AI route] Gemini error", response.status, errText);
    let userMessage = "AI request failed";
    if (response.status === 429) userMessage = "AI service is temporarily unavailable (rate limit). Please try again shortly.";
    else if (response.status === 400) userMessage = "Invalid request to AI service.";
    else if (response.status === 401 || response.status === 403) userMessage = "AI service authentication failed. Check GEMINI_API_KEY.";
    return NextResponse.json({ error: userMessage, detail: errText }, { status: response.status });
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
