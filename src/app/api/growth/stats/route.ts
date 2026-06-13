import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify premium
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = (sub?.plan === "premium" || sub?.plan === "annual") && sub?.status === "active";
  if (!isPremium) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  // Compute last 12 weeks of reading activity
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const [highlightsRes, journalRes, prayersRes, profileRes] = await Promise.all([
    // Chapters read: use verse_highlights as a proxy for "read" activity per week
    supabase
      .from("verse_highlights")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", twelveWeeksAgo.toISOString()),

    supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", twelveWeeksAgo.toISOString()),

    supabase
      .from("prayer_requests")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", twelveWeeksAgo.toISOString()),

    supabase
      .from("profiles")
      .select("streak_count, longest_streak, created_at")
      .eq("id", user.id)
      .single(),
  ]);

  // Build 12 weeks buckets
  const weeks: { weekStart: string; highlights: number; journal: number; prayers: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    // Normalize to Monday
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    weeks.push({
      weekStart: d.toISOString().slice(0, 10),
      highlights: 0,
      journal: 0,
      prayers: 0,
    });
  }

  const getWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  };

  for (const row of highlightsRes.data ?? []) {
    const ws = getWeekStart(row.created_at);
    const bucket = weeks.find((w) => w.weekStart === ws);
    if (bucket) bucket.highlights++;
  }
  for (const row of journalRes.data ?? []) {
    const ws = getWeekStart(row.created_at);
    const bucket = weeks.find((w) => w.weekStart === ws);
    if (bucket) bucket.journal++;
  }
  for (const row of prayersRes.data ?? []) {
    const ws = getWeekStart(row.created_at);
    const bucket = weeks.find((w) => w.weekStart === ws);
    if (bucket) bucket.prayers++;
  }

  const profile = profileRes.data;

  return NextResponse.json({
    weeks,
    totals: {
      streakCurrent: profile?.streak_count ?? 0,
      streakLongest: profile?.longest_streak ?? 0,
      journalTotal: (journalRes.data ?? []).length,
      prayersTotal: (prayersRes.data ?? []).length,
      memberSince: profile?.created_at ?? null,
    },
  }, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
