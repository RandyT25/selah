import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PrayerWall } from "@/components/community/PrayerWall";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Prayer" };

export default async function PrayerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [prayersResult, myPrayersResult, prayedForResult] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select("*, profiles(display_name, full_name, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("prayer_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("prayer_interactions")
      .select("prayer_request_id")
      .eq("user_id", user.id),
  ]);

  const publicPrayers = (prayersResult.data ?? []) as unknown as Parameters<typeof PrayerWall>[0]["publicPrayers"];
  const myPrayers = (myPrayersResult.data ?? []) as unknown as Parameters<typeof PrayerWall>[0]["myPrayers"];
  const prayedForIds = new Set((prayedForResult.data ?? []).map((p) => p.prayer_request_id));

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-2xl border-b border-border/30 px-4 pt-4 pb-3">
        <h1 className="text-[22px] font-bold">Prayer</h1>
      </div>
      <PrayerWall
        publicPrayers={publicPrayers}
        myPrayers={myPrayers}
        prayedForIds={prayedForIds}
        userId={user.id}
      />
    </div>
  );
}
