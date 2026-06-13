"use client";

import { useEffect } from "react";
import { SectionError } from "@/components/shared/SectionError";

export default function GrowthError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[growth]", error.message); }, [error]);
  return <SectionError title="Couldn't load growth stats" description="Your stats are safe — this section failed to load." onRetry={reset} />;
}
