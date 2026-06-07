import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [profileResult, journalCount, planCount] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("plan_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
  ]);

  // If no profile exists (user pre-dates trigger), create one
  if (!profileResult.data) {
    const meta = user.user_metadata as Record<string, string> | undefined;
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: meta?.full_name ?? meta?.name ?? null,
      avatar_url: meta?.avatar_url ?? meta?.picture ?? null,
    }, { onConflict: "id" });
    // Re-fetch
    const fresh = await supabase.from("profiles").select("*").eq("id", user.id).single();
    return (
      <ProfileClient
        profile={fresh.data}
        stats={{
          streak: fresh.data?.streak_count ?? 0,
          journalEntries: journalCount.count ?? 0,
          activePlans: planCount.count ?? 0,
        }}
      />
    );
  }

  return (
    <ProfileClient
      profile={profileResult.data}
      stats={{
        streak: profileResult.data?.streak_count ?? 0,
        journalEntries: journalCount.count ?? 0,
        activePlans: planCount.count ?? 0,
      }}
    />
  );
}
