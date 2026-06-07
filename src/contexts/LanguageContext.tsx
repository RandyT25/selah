"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Language } from "@/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (_s, k) => k,
});

export function LanguageProvider({
  children,
  initial = "en",
}: {
  children: React.ReactNode;
  initial?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initial);

  useEffect(() => {
    const stored = localStorage.getItem("selah_language") as Language | null;
    if (stored === "en" || stored === "id") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selah_language", lang);
    document.cookie = `selah_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const t = useCallback(
    (section: string, key: string): string => {
      const dict = translations[language] as Record<string, Record<string, string>>;
      return dict?.[section]?.[key] ?? (translations.en as Record<string, Record<string, string>>)?.[section]?.[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
