"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguagePickerModal } from "@/components/i18n/LanguagePickerModal";
import type { Language } from "@/i18n/translations";

export function AppShell({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  return (
    <LanguageProvider initial={initialLanguage}>
      {children}
      <LanguagePickerModal />
    </LanguageProvider>
  );
}
