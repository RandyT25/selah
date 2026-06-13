import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Flame, BookOpen, NotebookPen, HandHeart, TrendingUp, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GrowthStatsCard } from "@/components/premium/GrowthStatsCard";
import { GrowthChartSection } from "@/components/premium/GrowthChartSection";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Spiritual Growth" };

export default async function GrowthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = (sub?.plan === "premium" || sub?.plan === "annual") && sub?.status === "active";

  if (!isPremium) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Spiritual Growth Dashboard</h1>
          <p className="text-muted-foreground">
            Track your reading streaks, journaling habits, and prayer life over time. See your faith journey visualized week by week.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: Flame,       label: "Streak history",        sub: "12 weeks of daily check-ins" },
            { icon: BookOpen,    label: "Chapters read / week",  sub: "Visual reading progress"     },
            { icon: NotebookPen, label: "Journal trends",        sub: "How often you reflect"       },
            { icon: HandHeart,   label: "Prayer activity",       sub: "Prayers offered & received"  },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex gap-3 p-3 rounded-xl border bg-card">
              <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="gold" size="lg" asChild>
          <Link href="/bibleapp/upgrade">Unlock Growth Dashboard</Link>
        </Button>
        <p className="text-xs text-muted-foreground">Bible reading is always free. Premium unlocks analytics.</p>
      </div>
    );
  }

  // Fetch stats server-side for premium users
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  let statsData: {
    weeks: { weekStart: string; highlights: number; journal: number; prayers: number }[];
    totals: {
      streakCurrent: number;
      streakLongest: number;
      journalTotal: number;
      prayersTotal: number;
      memberSince: string | null;
    };
  } | null = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${baseUrl}/api/growth/stats`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      cache: "no-store",
    });
    if (res.ok) statsData = await res.json();
  } catch {
    // Fallback to empty state
  }

  const totals = statsData?.totals;
  const weeks  = statsData?.weeks ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Spiritual Growth</h1>
          {totals?.memberSince && (
            <p className="text-sm text-muted-foreground">
              Growing for {formatDistanceToNow(new Date(totals.memberSince))}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GrowthStatsCard icon={Flame}       label="Current Streak"  value={totals?.streakCurrent ?? 0} sub="days"      accent="amber" />
        <GrowthStatsCard icon={TrendingUp}  label="Longest Streak"  value={totals?.streakLongest ?? 0} sub="days ever" accent="green" />
        <GrowthStatsCard icon={NotebookPen} label="Journal Entries" value={totals?.journalTotal ?? 0}  sub="all time"  accent="blue"  />
        <GrowthStatsCard icon={HandHeart}   label="Prayers"         value={totals?.prayersTotal ?? 0}  sub="offered"   accent="rose"  />
      </div>

      {/* Charts */}
      <GrowthChartSection weeks={weeks} />

      {/* Encouragement */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="text-3xl">🌱</div>
          <div>
            <p className="font-semibold">Keep growing in faith</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Every verse read, every prayer offered, every journal entry written — they all count. Well done.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
