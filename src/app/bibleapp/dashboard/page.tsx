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
  Sparkles,
  Sun,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatStreakDays, getInitials } from "@/lib/utils/format";
import type { Profile, PlanProgress, ReadingPlan, JournalEntry, PrayerRequest, Devotional, VerseOfDay } from "@/types/database";

type PlanProgressWithPlan = PlanProgress & { reading_plans: ReadingPlan | null };
type PrayerWithProfile = PrayerRequest & {
  profiles: { display_name: string | null; full_name: string | null; avatar_url: string | null } | null;
};

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
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
    supabase.from("verse_of_day").select("*").lte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date", { ascending: false }).limit(1).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
    supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("prayer_requests").select("*, profiles(display_name, full_name, avatar_url)").eq("is_public", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("devotionals").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }).limit(2),
  ]);

  const profile = profileResult.data as Profile | null;
  const verseOfDay = verseResult.data as VerseOfDay | null;
  const activePlans = (plansResult.data ?? []) as unknown as PlanProgressWithPlan[];
  const recentJournal = (journalResult.data ?? []) as JournalEntry[];
  const publicPrayers = (prayersResult.data ?? []) as unknown as PrayerWithProfile[];
  const featuredDevotionals = (devosResult.data ?? []) as Devotional[];

  const displayName = profile?.display_name ?? profile?.full_name ?? "Friend";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {displayName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(new Date())} · {formatStreakDays(profile?.streak_count ?? 0)}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <div className="text-right">
            <p className="text-xl font-bold text-amber-600 leading-none">{profile?.streak_count ?? 0}</p>
            <p className="text-xs text-amber-600/70">day streak</p>
          </div>
        </div>
      </div>

      {/* Verse of the Day */}
      {verseOfDay && (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sun className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Verse of the Day</span>
            </div>
            <blockquote className="font-serif text-xl leading-relaxed text-foreground mb-3">
              "{verseOfDay.verse_text}"
            </blockquote>
            <p className="text-sm font-semibold text-primary">— {verseOfDay.verse_reference}</p>
            {verseOfDay.reflection && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {verseOfDay.reflection}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="gold" asChild>
                <Link href="/bibleapp/bible">Read Chapter</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/bibleapp/ai">Explore with AI</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Reading Plans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Reading Plans</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bibleapp/plans" className="text-primary">
                Browse Plans <ChevronRight className="h-4 w-4 ml-1" />
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
                            Day {progress.current_day} of {plan.duration_days}
                          </p>
                        </div>
                        <Badge variant="gold">{pct}%</Badge>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <Button size="sm" className="mt-3 w-full" variant="outline" asChild>
                        <Link href={`/bibleapp/plans/${progress.plan_id}`}>
                          Continue Reading
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
                <p className="text-sm font-medium">No active reading plans</p>
                <p className="text-xs text-muted-foreground mt-1">Start a plan to track your progress</p>
                <Button size="sm" variant="gold" className="mt-4" asChild>
                  <Link href="/bibleapp/plans">Browse Plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/bibleapp/bible", icon: BookOpen, label: "Read Bible", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
              { href: "/bibleapp/journal/new", icon: NotebookPen, label: "New Journal", color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
              { href: "/bibleapp/community/prayer", icon: HandHeart, label: "Prayer Wall", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
              { href: "/bibleapp/ai", icon: Sparkles, label: "Ask AI", color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
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
          {featuredDevotionals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Today's Devotional</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bibleapp/devotionals" className="text-primary">
                    All Devotionals <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              {featuredDevotionals.slice(0, 1).map((devo) => (
                <Card key={devo.id} className="card-hover">
                  <CardContent className="p-5">
                    <Badge variant="gold" className="mb-3">{devo.category}</Badge>
                    <h3 className="font-semibold text-base mb-2">{devo.title}</h3>
                    {devo.key_verse && (
                      <p className="text-sm text-muted-foreground italic mb-2">
                        "{devo.key_verse}" — {devo.key_verse_reference}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {devo.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{devo.reading_time_minutes} min read</span>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/bibleapp/devotionals/${devo.slug}`}>Read Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Journal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Journal</CardTitle>
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
                      {entry.title ?? "Untitled Entry"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.created_at)} · {entry.word_count} words
                    </p>
                    <Separator className="mt-3" />
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">No entries yet</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-primary" asChild>
                    <Link href="/bibleapp/journal/new">Write your first entry</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Prayer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prayer Wall</CardTitle>
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
                          {prayer.prayer_count} people praying
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No prayer requests</p>
              )}
              <Button size="sm" className="w-full" variant="outline" asChild>
                <Link href="/bibleapp/community/prayer">View All Requests</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
