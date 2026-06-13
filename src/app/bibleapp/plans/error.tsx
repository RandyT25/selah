"use client";

import { useEffect } from "react";
import { SectionError } from "@/components/shared/SectionError";

export default function PlansError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[plans]", error.message); }, [error]);
  return <SectionError title="Couldn't load reading plans" description="Reading plans failed to load. Please try again." onRetry={reset} />;
}
