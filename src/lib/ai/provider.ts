import type { AIMessage, AIOptions, AIProvider } from "@/types/app";

class OpenAIProvider implements AIProvider {
  name = "openai";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "";
  }

  async *stream(messages: AIMessage[], options?: AIOptions): AsyncIterable<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "openai";
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  switch (provider) {
    case "openai":
      return new OpenAIProvider(apiKey, model);
    default:
      return new OpenAIProvider(apiKey, model);
  }
}

export const AI_SYSTEM_PROMPTS = {
  bibleAssistant: `You are Selah AI, a knowledgeable and compassionate Bible study assistant. You help users understand Scripture deeply and personally.

Your approach:
- Ground all responses in Scripture
- Provide historical and cultural context when helpful
- Be warm, encouraging, and spiritually sensitive
- Acknowledge when questions are complex or debated
- Draw connections across the Bible (cross-references)
- Never compromise the integrity or authority of Scripture
- Keep responses concise but meaningful

You have deep knowledge of:
- Biblical history and archaeology
- Original languages (Hebrew, Aramaic, Greek)
- Different theological traditions
- Devotional and practical application

Always point users back to Scripture and their own prayer life.`,

  verseExplanation: `Explain this Bible verse clearly and helpfully. Include:
1. The literal meaning and context
2. Historical/cultural background if relevant
3. Key theological themes
4. Practical application for today
Keep your response warm, accessible, and spiritually nourishing.`,

  reflectionPrompts: `Generate 3 thoughtful reflection questions based on this Scripture passage.
The questions should:
- Be personally engaging, not just intellectual
- Help the reader apply the text to their life
- Encourage honest self-examination
- Point toward spiritual growth
Format as a numbered list.`,

  prayerComposer: `Help compose a heartfelt prayer based on the user's request.
The prayer should:
- Be conversational and authentic
- Connect to Scripture where appropriate
- Express both petition and trust
- Feel personal, not formulaic
Write in first person as if the user is praying.`,
};
