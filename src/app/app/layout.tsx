import { createClient } from "@/lib/supabase/server";
import { BottomTabBar } from "@/components/app/BottomTabBar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { cookies } from "next/headers";
import type { Language } from "@/i18n/translations";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth pages render without app chrome
  if (!user) {
    return (
      <LanguageProvider>
        <div className="min-h-[100dvh] bg-background">{children}</div>
      </LanguageProvider>
    );
  }

  const cookieStore = await cookies();
  const langCookie = cookieStore.get("selah_language")?.value;
  const initial: Language = langCookie === "id" ? "id" : "en";

  return (
    <LanguageProvider initial={initial}>
      {/* Safe-area top padding */}
      <div
        className="min-h-[100dvh] bg-white dark:bg-black flex flex-col"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </LanguageProvider>
  );
}
