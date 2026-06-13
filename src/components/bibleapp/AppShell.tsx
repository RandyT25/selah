"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguagePickerModal } from "@/components/i18n/LanguagePickerModal";
import { PremiumProvider } from "@/contexts/PremiumContext";
import type { Language } from "@/i18n/translations";
import type { Plan, SubscriptionStatus } from "@/lib/billing/plans";

export function AppShell({
  children,
  initialLanguage,
  onboardingCompleted = true,
  initialPlan = "free",
  initialStatus = "active",
  initialPeriodEnd = null,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
  onboardingCompleted?: boolean;
  initialPlan?: Plan;
  initialStatus?: SubscriptionStatus;
  initialPeriodEnd?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!onboardingCompleted && !pathname.startsWith("/bibleapp/onboarding")) {
      router.replace("/bibleapp/onboarding");
    }
  }, [onboardingCompleted, pathname, router]);

  return (
    <LanguageProvider initial={initialLanguage}>
      <PremiumProvider
        initialPlan={initialPlan}
        initialStatus={initialStatus}
        initialPeriodEnd={initialPeriodEnd}
      >
        {children}
        <LanguagePickerModal />
      </PremiumProvider>
    </LanguageProvider>
  );
}
