"use client";

import { useEffect } from "react";
import { SectionError } from "@/components/shared/SectionError";

export default function JournalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[journal]", error.message); }, [error]);
  return <SectionError title="Journal unavailable" description="Your journal entries are safe — this section failed to load." onRetry={reset} />;
}
