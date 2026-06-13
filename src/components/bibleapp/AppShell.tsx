"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguagePickerModal } from "@/components/i18n/LanguagePickerModal";
import type { Language } from "@/i18n/translations";

export function AppShell({
  children,
  initialLanguage,
  onboardingCompleted = true,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
  onboardingCompleted?: boolean;
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
      {children}
      <LanguagePickerModal />
    </LanguageProvider>
  );
}
