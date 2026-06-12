import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_count, longest_streak, last_active_at")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ ok: false }, { status: 404 });

    const now = new Date();
    const today = now.toDateString();
    const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;

    // Already checked in today — nothing to do
    if (lastActive?.toDateString() === today) {
      return NextResponse.json({ ok: true, streak: profile.streak_count });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const newStreak =
      lastActive?.toDateString() === yesterday.toDateString()
        ? (profile.streak_count ?? 0) + 1
        : 1;

    await supabase
      .from("profiles")
      .update({
        streak_count: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak ?? 0),
        last_active_at: now.toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, streak: newStreak });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/daily-checkin]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
