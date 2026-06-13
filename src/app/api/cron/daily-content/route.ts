import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  // ── 1. Today's verse ────────────────────────────────────────────────────────
  let verse: { verse_reference: string; verse_text: string } | null = null;

  const { data: todayVerse } = await admin
    .from("verse_of_day")
    .select("verse_reference, verse_text")
    .eq("scheduled_date", today)
    .single();

  if (todayVerse) {
    verse = todayVerse;
  } else {
    const { data: allVerses } = await admin
      .from("verse_of_day")
      .select("verse_reference, verse_text")
      .order("scheduled_date", { ascending: true });
    if (allVerses && allVerses.length > 0) {
      verse = allVerses[dayOfYear % allVerses.length];
    }
  }

  // ── 2. Today's devotional ───────────────────────────────────────────────────
  let devotional: { title: string; slug: string; excerpt: string | null } | null = null;

  const { data: allDevotionals } = await admin
    .from("devotionals")
    .select("title, slug, excerpt")
    .eq("is_published", true)
    .order("published_at", { ascending: true });

  if (allDevotionals && allDevotionals.length > 0) {
    devotional = allDevotionals[dayOfYear % allDevotionals.length];
  }

  if (!verse && !devotional) {
    return NextResponse.json({ ok: true, skipped: "no content" });
  }

  // ── 3. ALL users (in-app bell goes to everyone) ─────────────────────────────
  // Use profiles as the source of truth so users without a prefs row are included.
  // verse_of_day → all users; reading_reminder → only those with flag enabled.
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("id");

  if (profilesErr || !profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: "no users found" });
  }

  const { data: prefsRows } = await admin
    .from("user_preferences")
    .select("user_id, reading_reminder_enabled");

  const prefsMap = new Map((prefsRows ?? []).map((p) => [p.user_id, p]));

  // Merge: every profile gets a record, with pref defaults if missing
  const allPrefs = profiles.map((p) => ({
    user_id: p.id,
    reading_reminder_enabled: prefsMap.get(p.id)?.reading_reminder_enabled ?? false,
  }));

  // ── 4. Dedup: skip users who already got verse_of_day today ────────────────
  const todayStart = `${today}T00:00:00.000Z`;
  const { data: alreadyNotified } = await admin
    .from("notifications")
    .select("user_id")
    .eq("type", "verse_of_day")
    .gte("created_at", todayStart);

  const alreadySet = new Set((alreadyNotified ?? []).map((r) => r.user_id));
  const targets = allPrefs.filter((p) => !alreadySet.has(p.user_id as string));

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: "already sent today" });
  }

  // ── 5. Build rows ───────────────────────────────────────────────────────────
  const rows: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    data: { [key: string]: string };
  }[] = [];

  for (const pref of targets) {
    if (verse) {
      rows.push({
        user_id: pref.user_id,
        type: "verse_of_day",
        title: verse.verse_reference,
        body: verse.verse_text.slice(0, 140),
        data: { verse_reference: verse.verse_reference },
      });
    }

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
