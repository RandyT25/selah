import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";
import { getDailyFallbackVerse } from "@/lib/bible/fallback-verses";

export const runtime = "nodejs";
export const maxDuration = 60;

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_SUBJECT}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  // ── 1. Today's verse ────────────────────────────────────────────────────────
  // Always send — fall back to the same rotating array the dashboard uses
  let verse: { verse_reference: string; verse_text: string };

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
    verse = allVerses && allVerses.length > 0
      ? allVerses[dayOfYear % allVerses.length]
      : getDailyFallbackVerse();
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

  if (!verse) {
    return NextResponse.json({ ok: true, skipped: "no content" });
  }

  // ── 3. All user profiles ────────────────────────────────────────────────────
  const { data: profiles, error: profilesErr } = await admin.from("profiles").select("id");
  if (profilesErr || !profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: "no users" });
  }

  const { data: prefsRows } = await admin
    .from("user_preferences")
    .select("user_id, reading_reminder_enabled");
  const prefsMap = new Map((prefsRows ?? []).map((p) => [p.user_id, p]));
  const allPrefs = profiles.map((p) => ({
    user_id: p.id,
    reading_reminder_enabled: prefsMap.get(p.id)?.reading_reminder_enabled ?? false,
  }));

  // ── 4. Dedup: skip users already notified today ─────────────────────────────
  const todayStart = `${today}T00:00:00.000Z`;
  const { data: alreadyNotified } = await admin
    .from("notifications")
    .select("user_id")
    .eq("type", "verse_of_day")
    .gte("created_at", todayStart);

  const alreadySet = new Set((alreadyNotified ?? []).map((r) => r.user_id as string));
  const targets = force
    ? allPrefs
    : allPrefs.filter((p) => !alreadySet.has(p.user_id as string));

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, reason: "already sent today" });
  }

  // ── 5. Insert in-app notifications ──────────────────────────────────────────
  const rows: { user_id: string; type: string; title: string; body: string; data: { [key: string]: string } }[] = [];

  for (const pref of targets) {
    rows.push({
      user_id: pref.user_id as string,
      type: "verse_of_day",
      title: verse.verse_reference,
      body: verse.verse_text.slice(0, 140),
      data: { verse_reference: verse.verse_reference },
    });
    if (pref.reading_reminder_enabled && devotional) {
      rows.push({
        user_id: pref.user_id as string,
        type: "reading_reminder",
        title: devotional.title,
        body: devotional.excerpt?.slice(0, 120) ?? "Open today's devotional",
        data: { slug: devotional.slug },
      });
    }
  }

  const { error: insertErr } = await admin.from("notifications").insert(rows);
  if (insertErr) {
    console.error("[cron] insert error:", insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // ── 6. Send Web Push to subscribed devices ───────────────────────────────────
  const targetIds = targets.map((p) => p.user_id as string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pushSubs } = await (admin as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .in("user_id", targetIds);

  const pushPayload = JSON.stringify({
    title: verse.verse_reference,
    body: verse.verse_text.slice(0, 120),
    url: "/bibleapp/dashboard",
  });

  let pushed = 0;
  let pushFailed = 0;

  await Promise.allSettled(
    (pushSubs ?? []).map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload
        );
        pushed++;
      } catch (err: unknown) {
        // 410 Gone = subscription expired, remove it
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin as any).from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
        pushFailed++;
      }
    })
  );

  return NextResponse.json({
    ok: true,
    date: today,
    verse: verse?.verse_reference ?? null,
    devotional: devotional?.title ?? null,
    notified: targets.length,
    db_rows: rows.length,
    push_sent: pushed,
    push_failed: pushFailed,
  });
}
