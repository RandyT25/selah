"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { canAccessFeature, isPremiumPlan, type Plan, type SubscriptionStatus } from "@/lib/billing/plans";

interface PremiumState {
  plan: Plan;
  status: SubscriptionStatus;
  isPremium: boolean;
  currentPeriodEnd: string | null;
  isLoading: boolean;
  canAccess: (featureKey: string) => boolean;
  refresh: () => Promise<void>;
}

const PremiumContext = createContext<PremiumState>({
  plan: "free",
  status: "active",
  isPremium: false,
  currentPeriodEnd: null,
  isLoading: false,
  canAccess: () => false,
  refresh: async () => {},
});

export function PremiumProvider({
  children,
  initialPlan = "free",
  initialStatus = "active",
  initialPeriodEnd = null,
}: {
  children: React.ReactNode;
  initialPlan?: Plan;
  initialStatus?: SubscriptionStatus;
  initialPeriodEnd?: string | null;
}) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(initialPeriodEnd);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/billing/status");
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan ?? "free");
        setStatus(data.status ?? "active");
        setCurrentPeriodEnd(data.currentPeriodEnd ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const premium = isPremiumPlan(plan, status);
  const canAccess = useCallback(
    (featureKey: string) => canAccessFeature(premium ? plan : "free", featureKey),
    [plan, premium]
  );

  return (
    <PremiumContext.Provider value={{
      plan,
      status,
      isPremium: premium,
      currentPeriodEnd,
      isLoading,
      canAccess,
      refresh,
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremiumContext() {
  return useContext(PremiumContext);
}
