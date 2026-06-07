import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Flame, BookOpen, NotebookPen, ChevronRight,
  Sparkles, Sun, HandHeart, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";
import type { Profile, PlanProgress, ReadingPlan, Devotional, VerseOfDay } from "@/types/database";

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

export const metadata = { title: "Home" };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [profileResult, verseResult, plansResult, devosResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("verse_of_day").select("*").lte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date", { ascending: false }).limit(1).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
    supabase.from("devotionals").select("*").eq("is_published", true).eq("is_featured", true).order("published_at", { ascending: false }).limit(1),
  ]);

  const profile = profileResult.data as Profile | null;
  const verseOfDay = verseResult.data as VerseOfDay | null;
  const activePlans = (plansResult.data ?? []) as unknown as PlanWithProgress[];
  const devotional = ((devosResult.data ?? []) as Devotional[])[0] ?? null;

  const displayName = profile?.display_name ?? profile?.full_name ?? "Friend";
  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const streak = profile?.streak_count ?? 0;

  return (
    <div className="min-h-full">
      {/* ── Top greeting bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{greeting}</p>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">{firstName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Streak pill */}
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-full px-3 py-1.5">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{streak}</span>
          </div>
          {/* Avatar */}
          <Link href="/app/profile">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {getInitials(profile?.full_name ?? profile?.email ?? "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* ── Daily Verse card ── */}
      {verseOfDay && (
        <div className="mx-4 mt-3 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-px shadow-lg shadow-amber-500/20">
          <div className="rounded-[23px] bg-gradient-to-br from-amber-500 to-orange-600 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                <Sun className="h-4 w-4 text-white" />
              </div>
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">Verse of the Day</span>
            </div>
            <blockquote className="font-serif text-white text-[17px] leading-[1.6] mb-3">
              "{verseOfDay.verse_text}"
            </blockquote>
            <p className="text-white/80 text-sm font-semibold">— {verseOfDay.verse_reference}</p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/app/bible"
                className="flex-1 bg-white/20 hover:bg-white/30 active:bg-white/10 text-white text-sm font-semibold rounded-2xl py-2.5 text-center transition-colors"
              >
                Read Chapter
              </Link>
              <Link
                href="/app/bible"
                className="bg-white/20 hover:bg-white/30 active:bg-white/10 text-white text-sm font-semibold rounded-2xl px-4 py-2.5 text-center transition-colors"
              >
                Share
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/app/bible",     icon: BookOpen,    label: "Bible",   bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-600 dark:text-blue-400" },
            { href: "/app/journal/new", icon: NotebookPen, label: "Journal", bg: "bg-green-50 dark:bg-green-950/40",  text: "text-green-600 dark:text-green-400" },
            { href: "/app/prayer",    icon: HandHeart,   label: "Prayer",  bg: "bg-rose-50 dark:bg-rose-950/40",   text: "text-rose-600 dark:text-rose-400" },
            { href: "/app/plans",     icon: CalendarDays, label: "Plans",  bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400" },
          ].map(({ href, icon: Icon, label, bg, text }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-full aspect-square rounded-2xl flex items-center justify-center ${bg}`}>
                <Icon className={`h-6 w-6 ${text}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Reading Plans ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-[17px] font-bold">Reading Plans</h2>
          <Link href="/app/plans" className="flex items-center text-primary text-sm font-semibold">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {activePlans.length > 0 ? (
          <div className="flex gap-3 px-4 overflow-x-auto pb-1 scrollbar-hide">
            {activePlans.map((progress) => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
              return (
                <Link
                  key={progress.id}
                  href={`/app/plans/${progress.plan_id}`}
                  className="flex-shrink-0 w-[200px] bg-card border border-border rounded-3xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      Day {progress.current_day}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2">{plan.title}</h3>
                  <Progress value={pct} className="h-1.5 mb-1" />
                  <p className="text-[10px] text-muted-foreground">{pct}% complete · {plan.duration_days} days</p>
                </Link>
              );
            })}
            {/* Add plan card */}
            <Link
              href="/app/plans"
              className="flex-shrink-0 w-[160px] border-2 border-dashed border-border rounded-3xl p-4 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs font-medium text-muted-foreground text-center">Start a new plan</p>
            </Link>
          </div>
        ) : (
          <div className="mx-4 border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold text-sm">No active plans</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Start a reading plan to track your journey</p>
            <Link
              href="/app/plans"
              className="bg-primary text-primary-foreground text-sm font-semibold rounded-2xl px-5 py-2.5 active:opacity-80 transition-opacity"
            >
              Browse Plans
            </Link>
          </div>
        )}
      </div>

      {/* ── Today's Devotional ── */}
      {devotional && (
        <div className="px-4 mt-6">
          <h2 className="text-[17px] font-bold mb-3">Today&apos;s Devotional</h2>
          <Link
            href={`/bibleapp/devotionals/${devotional.slug}`}
            className="block rounded-3xl overflow-hidden border border-border bg-card shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
              <Badge className="bg-primary/80 text-white border-0 text-[10px] mb-2">{devotional.category}</Badge>
              <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{devotional.title}</h3>
              {devotional.key_verse_reference && (
                <p className="text-white/60 text-xs mt-1">{devotional.key_verse_reference}</p>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{devotional.excerpt}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{devotional.reading_time_minutes} min read</span>
                <div className="flex items-center text-primary text-xs font-semibold gap-1">
                  Read now <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── AI Study ── */}
      <div className="px-4 mt-6 mb-6">
        <Link
          href="/bibleapp/ai"
          className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-800/30 rounded-3xl p-4 active:scale-[0.99] transition-transform"
        >
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">AI Bible Study</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ask any question about Scripture</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
