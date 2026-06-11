"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, BookOpen, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { AIMessage } from "@/types/app";

const SUGGESTED_PROMPTS = [
  "What does John 3:16 mean?",
  "Explain the Sermon on the Mount",
  "What does the Bible say about anxiety?",
  "Who was the Apostle Paul?",
  "Explain the parable of the Prodigal Son",
  "What is the fruit of the Spirit?",
  "Help me understand the book of Revelation",
  "What does the Bible say about forgiveness?",
];

export function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = text ?? input.trim();
    if (!userMessage || loadingRef.current) return;
    loadingRef.current = true;

    const userMsg: AIMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error || "AI request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const assistantMsg: AIMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMsg.content += chunk;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { ...assistantMsg },
        ]);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        const withoutEmptyAssistant = last?.role === "assistant" && !last.content ? prev.slice(0, -1) : prev;
        return [
          ...withoutEmptyAssistant,
          {
            role: "assistant" as const,
            content: `Error: ${detail}`,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 selah-gradient rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base">Selah AI</h1>
              <p className="text-xs text-muted-foreground">Bible Study Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="gold">Beta</Badge>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMessages([])}
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 selah-gradient rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Ask anything about Scripture</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              I'm your AI Bible study companion. Ask me about verses, theology, history, application, and more.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-lg border bg-card hover:bg-muted hover:border-primary/30 transition-all text-sm text-muted-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  {msg.role === "assistant" ? (
                    <AvatarFallback className="selah-gradient text-white text-xs font-bold">
                      S
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      You
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.content.split("\n").map((line, j) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <strong key={j}>{line.slice(2, -2)}</strong>;
                        }
                        if (!line) return <br key={j} />;
                        return <p key={j} className="mb-1 last:mb-0">{line}</p>;
                      })}
                      {loading && i === messages.length - 1 && msg.content === "" && (
                        <div className="flex gap-1 items-center h-4">
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t">
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Ask about any Bible verse, passage, or theological question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[52px] max-h-32 resize-none"
            disabled={loading}
          />
          <Button
            variant="gold"
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="shrink-0 h-[52px] w-[52px]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Selah AI can make mistakes. Always verify with Scripture.
        </p>
      </div>
    </div>
  );
}
