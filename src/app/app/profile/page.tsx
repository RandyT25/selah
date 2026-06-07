import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [profileResult, prefsResult, journalCount, planCount] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("plan_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
  ]);

  return (
    <ProfileClient
      profile={profileResult.data}
      prefs={prefsResult.data}
      stats={{
        streak: profileResult.data?.streak_count ?? 0,
        journalEntries: journalCount.count ?? 0,
        activePlans: planCount.count ?? 0,
      }}
    />
  );
}
