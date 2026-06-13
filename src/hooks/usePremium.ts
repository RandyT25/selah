"use client";

import { useRouter } from "next/navigation";
import { usePremiumContext } from "@/contexts/PremiumContext";

export function usePremium() {
  const ctx = usePremiumContext();
  const router = useRouter();

  return {
    ...ctx,
    upgrade: () => router.push("/bibleapp/upgrade"),
  };
}
