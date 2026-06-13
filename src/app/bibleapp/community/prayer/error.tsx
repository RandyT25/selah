"use client";

import { useEffect } from "react";
import { SectionError } from "@/components/shared/SectionError";

export default function PrayerError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("[prayer]", error.message); }, [error]);
  return <SectionError title="Prayer wall unavailable" description="Couldn't load the prayer wall right now." onRetry={reset} />;
}
