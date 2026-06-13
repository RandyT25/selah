"use client";

import { usePremium } from "@/hooks/usePremium";
import { UpgradeBanner } from "@/components/billing/UpgradeBanner";

export function DashboardBanner() {
  const { isPremium } = usePremium();
  if (isPremium) return null;
  return <UpgradeBanner />;
}
