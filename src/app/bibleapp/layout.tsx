import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BibleAppSidebar } from "@/components/bibleapp/BibleAppSidebar";
import { BibleAppMobileNav } from "@/components/bibleapp/BibleAppMobileNav";
import { BibleAppHeader } from "@/components/bibleapp/BibleAppHeader";
import { AppShell } from "@/components/bibleapp/AppShell";
import { PushPermission } from "@/components/bibleapp/PushPermission";
import type { Language } from "@/i18n/translations";

export default async function BibleAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth pages (login, register, forgot-password) render without the app shell
  if (!user) {
    return <>{children}</>;
  }

  const [profileResult, unreadResult, cookieStore] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
    cookies(),
  ]);

  const profile = profileResult.data;
  const unreadCount = unreadResult.count ?? 0;
  const lang = (cookieStore.get("selah_language")?.value ?? "") as Language;
  const initialLanguage: Language = lang === "id" ? "id" : "en";
  const onboardingCompleted = profile?.onboarding_completed ?? true;

  return (
    <AppShell initialLanguage={initialLanguage} onboardingCompleted={onboardingCompleted}>
      <div className="flex min-h-screen bg-background">
        <BibleAppSidebar profile={profile} userId={user.id} unreadNotifications={unreadCount} />
        <div className="flex-1 flex flex-col min-w-0">
          <BibleAppHeader profile={profile} userId={user.id} unreadNotifications={unreadCount} />
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
        <BibleAppMobileNav />
        <PushPermission />
      </div>
    </AppShell>
  );
}
