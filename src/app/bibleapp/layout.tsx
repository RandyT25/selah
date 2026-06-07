import { createClient } from "@/lib/supabase/server";
import { BibleAppSidebar } from "@/components/bibleapp/BibleAppSidebar";
import { BibleAppMobileNav } from "@/components/bibleapp/BibleAppMobileNav";
import { BibleAppHeader } from "@/components/bibleapp/BibleAppHeader";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen bg-background">
      <BibleAppSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <BibleAppHeader profile={profile} unreadNotifications={unreadCount ?? 0} />
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <BibleAppMobileNav />
    </div>
  );
}
