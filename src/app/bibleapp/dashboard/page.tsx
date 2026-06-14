import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  NotebookPen,
  HandHeart,
  Flame,
  ChevronRight,
  Sun,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, getInitials } from "@/lib/utils/format";
import { isToday, isYesterday, format } from "date-fns";
import type { Profile, PlanProgress, ReadingPlan, JournalEntry, PrayerRequest, Devotional, VerseOfDay } from "@/types/database";
import { DailyCheckIn } from "@/components/dashboard/DailyCheckIn";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { getServerT } from "@/lib/utils/server-i18n";
import { fetchAytVerse, localizeVerseReference } from "@/lib/bible/ayt";
import { translateAllToId } from "@/lib/utils/translate";
import { cookies } from "next/headers";
import { getDailyFallbackVerse } from "@/lib/bible/fallback-verses";

type PlanProgressWithPlan = PlanProgress & { reading_plans: ReadingPlan | null };
type PrayerWithProfile = PrayerRequest & {
  profiles: { display_name: string | null; full_name: string | null; avatar_url: string | null } | null;
};

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [supabase, t, cookieStore] = await Promise.all([createClient(), getServerT(), cookies()]);
  const isIndo = cookieStore.get("selah_language")?.value === "id";
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const [
    profileResult,
    verseResult,
    plansResult,
    journalResult,
    prayersResult,
    devosResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("verse_of_day").select("*").eq("scheduled_date", new Date().toISOString().split("T")[0]).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
    supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("prayer_requests").select("*, profiles(display_name, full_name, avatar_url)").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("devotionals").select("*").eq("is_published", true).order("published_at", { ascending: true }),
  ]);

  const profile = profileResult.data as Profile | null;
  const verseRaw = verseResult.data as VerseOfDay | null;
  const fallbackVerse = getDailyFallbackVerse();
  const verseOfDay = verseRaw ?? fallbackVerse;

  const allDevotionals = (devosResult.data ?? []) as Devotional[];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const devo = allDevotionals.length > 0 ? allDevotionals[dayOfYear % allDevotionals.length] : null;

  const rawReflection = "reflection" in verseOfDay ? (verseOfDay.reflection as string | null) : null;

  // Fetch AYT verse + translate English editorial content — all in parallel
  const [
    aytVerseText,
    aytDevoKeyVerse,
    [translatedReflection, translatedDevoTitle, translatedDevoExcerpt],
  ] = await Promise.all([
    isIndo ? fetchAytVerse(verseOfDay.verse_reference) : Promise.resolve(null),
    isIndo && devo?.key_verse_reference ? fetchAytVerse(devo.key_verse_reference) : Promise.resolve(null),
    isIndo
      ? translateAllToId([rawReflection, devo?.title ?? null, devo?.excerpt ?? null])
      : Promise.resolve([rawReflection, devo?.title ?? null, devo?.excerpt ?? null]),
  ]);

  const verseText = aytVerseText ?? verseOfDay.verse_text;
  const verseReference = isIndo ? localizeVerseReference(verseOfDay.verse_reference) : verseOfDay.verse_reference;
  const verseReflection = translatedReflection;

  // Devotional: prefer manually translated DB fields (_id), fall back to auto-translated
  const devoTitle = devo ? (isIndo ? (devo.title_id ?? translatedDevoTitle ?? devo.title) : devo.title) : null;
  const devoExcerpt = devo ? (isIndo ? (devo.excerpt_id ?? translatedDevoExcerpt ?? devo.excerpt) : devo.excerpt) : null;
  const devoKeyVerse = devo ? (isIndo ? (aytDevoKeyVerse ?? devo.key_verse_id ?? devo.key_verse) : devo.key_verse) : null;
  const devoKeyVerseRef = devo?.key_verse_reference
    ? (isIndo ? localizeVerseReference(devo.key_verse_reference) : devo.key_verse_reference)
    : null;
  const showDevo = devo !== null;

  const activePlans = (plansResult.data ?? []) as unknown as PlanProgressWithPlan[];
  const recentJournal = (journalResult.data ?? []) as JournalEntry[];
  const publicPrayers = (prayersResult.data ?? []) as unknown as PrayerWithProfile[];

  const displayName = profile?.display_name ?? profile?.full_name ?? "Friend";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("home", "greeting_morning") : hour < 17 ? t("home", "greeting_afternoon") : t("home", "greeting_evening");

  const now = new Date();
  const dateLabel = isToday(now) ? t("common", "today") : isYesterday(now) ? t("common", "yesterday") : format(now, "MMMM d, yyyy");
  const streakLabel = `${profile?.streak_count ?? 0} ${t("home", "streak")}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <DailyCheckIn />
      <PWAInstallBanner />
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {dateLabel} · {streakLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-2.5">
          <div className="bg-amber-100 dark:bg-amber-900/40 rounded-xl p-2">
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 leading-none">{profile?.streak_count ?? 0}</p>
            <p className="text-[11px] text-amber-600/70 mt-0.5 font-medium">{t("home", "streak")}</p>
          </div>
        </div>
      </div>

      {/* Verse of the Day */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Sun className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">{t("home", "daily_verse")}</span>
          </div>
          <blockquote className="font-serif text-xl leading-relaxed text-foreground mb-3">
            "{verseText}"
          </blockquote>
          <p className="text-sm font-semibold text-primary">— {verseReference}</p>
          {verseReflection && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {verseReflection}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="gold" asChild>
              <Link href="/bibleapp/bible">{t("home", "read_bible")}</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/bibleapp/journal/new">{t("home", "journal_reflection")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Reading Plans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("home", "active_plans")}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bibleapp/plans" className="text-primary">
                {t("home", "browse_plans")} <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {activePlans.length > 0 ? (
            <div className="space-y-3">
              {activePlans.map((progress) => {
                const plan = progress.reading_plans;
                if (!plan) return null;
                const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
                return (
                  <Card key={progress.id} className="card-hover">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{plan.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("plans", "day")} {progress.current_day} {t("plans", "of")} {plan.duration_days}
                          </p>
                        </div>
                        <Badge variant="gold">{pct}%</Badge>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <Button size="sm" className="mt-3 w-full" variant="outline" asChild>
                        <Link href={`/bibleapp/plans/${progress.plan_id}`}>
                          {t("home", "continue_reading")}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{t("plans", "no_active_plans")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("plans", "start_track")}</p>
                <Button size="sm" variant="gold" className="mt-4" asChild>
                  <Link href="/bibleapp/plans">{t("home", "browse_plans")}</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/bibleapp/bible", icon: BookOpen, label: t("home", "read_bible"), color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
              { href: "/bibleapp/journal/new", icon: NotebookPen, label: t("home", "new_journal"), color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
              { href: "/bibleapp/community/prayer", icon: HandHeart, label: t("home", "prayer_wall"), color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
              { href: "/bibleapp/plans", icon: Calendar, label: t("nav", "plans"), color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
            ].map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-sm transition-all card-hover text-center"
              >
                <div className={`p-2.5 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Featured Devotionals */}
          {showDevo && devo && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{t("home", "devotional")}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bibleapp/devotionals" className="text-primary">
                    {t("home", "all_devotionals")} <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <Badge variant="gold" className="mb-3">{devo.category}</Badge>
                  <h3 className="font-semibold text-base mb-2">{devoTitle}</h3>
                  {devoKeyVerse && devoKeyVerseRef && (
                    <p className="text-sm text-muted-foreground italic mb-2">
                      "{devoKeyVerse}" — {devoKeyVerseRef}
                    </p>
                  )}
                  {devoExcerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {devoExcerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{devo.reading_time_minutes} {t("home", "min_read")}</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/bibleapp/devotionals/${devo.slug}`}>{t("home", "read_now")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Journal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("home", "recent_journal")}</CardTitle>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href="/bibleapp/journal"><ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {recentJournal.length > 0 ? (
                recentJournal.map((entry) => (
                  <Link key={entry.id} href={`/bibleapp/journal/${entry.id}`} className="block group">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {entry.title ?? t("journal", "untitled")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.created_at)} · {entry.word_count} {t("common", "words")}
                    </p>
                    <Separator className="mt-3" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">{t("home", "no_entries")}</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-primary" asChild>
                    <Link href="/bibleapp/journal/new">{t("home", "write_first")}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Prayer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("home", "prayer_wall")}</CardTitle>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link href="/bibleapp/community/prayer"><ChevronRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {publicPrayers.length > 0 ? (
                publicPrayers.map((prayer) => (
                  <div key={prayer.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarImage src={prayer.is_anonymous ? undefined : (prayer.profiles?.avatar_url ?? undefined)} />
                        <AvatarFallback className="text-[10px]">
                          {prayer.is_anonymous ? "?" : getInitials(prayer.profiles?.full_name ?? "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{prayer.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {prayer.prayer_count} {t("home", "people_praying")}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">{t("home", "no_prayer_requests")}</p>
              )}
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/bibleapp/community/prayer">{t("home", "view_requests")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
