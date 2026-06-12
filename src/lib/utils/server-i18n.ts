import { cookies } from "next/headers";
import { translations, type Language } from "@/i18n/translations";

export async function getServerT() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("selah_language")?.value;
  const language: Language = lang === "id" ? "id" : "en";
  return (section: string, key: string): string => {
    const dict = translations[language] as Record<string, Record<string, string>>;
    return dict?.[section]?.[key] ?? (translations.en as Record<string, Record<string, string>>)?.[section]?.[key] ?? key;
  };
}
