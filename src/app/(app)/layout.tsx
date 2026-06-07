import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompactSidebar } from "@/components/layout/CompactSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AppHeader } from "@/components/layout/AppHeader";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
      {/* Desktop: compact icon sidebar */}
      <CompactSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only header */}
        <AppHeader
          profile={profile}
          unreadNotifications={unreadCount ?? 0}
        />

        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
