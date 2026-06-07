import { createClient } from "@/lib/supabase/server";
import { PrayerWall } from "@/components/community/PrayerWall";
import type { PrayerRequest } from "@/types/database";
import type { Metadata } from "next";

type PrayerWithAuthor = PrayerRequest & {
  profiles: { id: string; full_name: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export const metadata: Metadata = { title: "Prayer Wall" };

export default async function PrayerWallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const prayersResult = await supabase
    .from("prayer_requests")
    .select("*, profiles(id, full_name, display_name, avatar_url)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const myPrayersResult = user ? await supabase
    .from("prayer_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10) : { data: [] };

  const prayedForResult = user ? await supabase
    .from("prayer_interactions")
    .select("prayer_request_id")
    .eq("user_id", user.id) : { data: [] };

  const prayers = (prayersResult.data ?? []) as unknown as PrayerWithAuthor[];
  const myPrayers = (myPrayersResult.data ?? []) as PrayerRequest[];
  const prayedForIds = new Set<string>((prayedForResult.data ?? []).map((p: { prayer_request_id: string }) => p.prayer_request_id));

  return (
    <PrayerWall
      publicPrayers={prayers ?? []}
      myPrayers={myPrayers ?? []}
      prayedForIds={prayedForIds}
      userId={user?.id}
    />
  );
}
