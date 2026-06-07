import { AIAssistant } from "@/components/ai/AIAssistant";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Bible Assistant" };

export default function AIPage() {
  return <AIAssistant />;
}
