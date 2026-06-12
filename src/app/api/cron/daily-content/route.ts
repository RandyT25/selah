import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // ── 1. Today's verse of the day ──────────────────────────────────────────
  let verse: { verse_reference: string; verse_text: string } | null = null;

  const { data: todayVerse } = await admin
    .from("verse_of_day")
    .select("verse_reference, verse_text")
    .eq("scheduled_date", today)
    .single();

  if (todayVerse) {
    verse = todayVerse;
  } else {
    // Fallback: rotate by day-of-year across all existing verses
    const { data: allVerses } = await admin
      .from("verse_of_day")
      .select("verse_reference, verse_text")
      .order("scheduled_date", { ascending: true });

    if (allVerses && allVerses.length > 0) {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      verse = allVerses[dayOfYear % allVerses.length];
    }
  }

  // ── 2. Today's devotional (day-of-year rotation) ─────────────────────────
  let devotional: { title: string; slug: string; excerpt: string | null } | null = null;

  const { data: allDevotionals } = await admin
    .from("devotionals")
    .select("title, slug, excerpt")
    .eq("is_published", true)
    .order("published_at", { ascending: true });

  if (allDevotionals && allDevotionals.length > 0) {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    devotional = allDevotionals[dayOfYear % allDevotionals.length];
  }

  if (!verse && !devotional) {
    return NextResponse.json({ ok: true, skipped: "no content to notify about" });
  }

  // ── 3. Users who have notifications enabled ───────────────────────────────
  const { data: prefs, error: prefsErr } = await admin
    .from("user_preferences")
    .select("user_id, reading_reminder_enabled, push_notifications_enabled")
    .or("reading_reminder_enabled.eq.true,push_notifications_enabled.eq.true");

  if (prefsErr || !prefs || prefs.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 });
  }

  // ── 4. Skip users who already got a verse_of_day notification today ───────
  const todayStart = `${today}T00:00:00.000Z`;
  const { data: alreadyNotified } = await admin
    .from("notifications")
    .select("user_id")
    .eq("type", "verse_of_day")
    .gte("created_at", todayStart);

  const alreadySet = new Set((alreadyNotified ?? []).map((r) => r.user_id));
  const targets = prefs.filter((p) => !alreadySet.has(p.user_id));

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: "already sent today" });
  }

  // ── 5. Build and insert notifications ─────────────────────────────────────
  const rows: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    data: { [key: string]: string };
  }[] = [];

  for (const pref of targets) {
    // Verse of day notification
    if (verse) {
      rows.push({
        user_id: pref.user_id,
        type: "verse_of_day",
        title: verse.verse_reference,
        body: verse.verse_text.slice(0, 140),
        data: { verse_reference: verse.verse_reference },
      });
    }

    // Reading reminder notification (links to today's devotional)
    if (pref.reading_reminder_enabled && devotional) {
      rows.push({
        user_id: pref.user_id,
        type: "reading_reminder",
        title: devotional.title,
        body: devotional.excerpt?.slice(0, 120) ?? "Open today's devotional",
        data: { slug: devotional.slug },
      });
    }
  }

  const { error: insertErr } = await admin.from("notifications").insert(rows);

  if (insertErr) {
    console.error("[cron/daily-content] insert error:", insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    date: today,
    verse: verse?.verse_reference ?? null,
    devotional: devotional?.title ?? null,
    notified: targets.length,
    rows: rows.length,
  });
}
