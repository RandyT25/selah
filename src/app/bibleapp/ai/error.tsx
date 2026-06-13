"use client";

import { useEffect } from "react";
import { SectionError } from "@/components/shared/SectionError";

export default function AIError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[ai]", error.message); }, [error]);
  return <SectionError title="AI assistant unavailable" description="The AI service couldn't be reached. Please try again." onRetry={reset} />;
}
