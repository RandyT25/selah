import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Flame, BookOpen, ChevronRight, Share2, Heart,
  Maximize2, Copy, CalendarDays,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils/format";
import type { Profile, PlanProgress, ReadingPlan, VerseOfDay } from "@/types/database";

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

export const metadata = { title: "Home" };

const FALLBACK_VERSE = {
  verse_text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
  verse_reference: "Isaiah 41:10",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [profileResult, verseResult, plansResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("verse_of_day").select("*").lte("scheduled_date", new Date().toISOString().split("T")[0]).order("scheduled_date", { ascending: false }).limit(1).single(),
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(4),
  ]);

  const profile = profileResult.data as Profile | null;
  const verse = (verseResult.data as VerseOfDay | null) ?? FALLBACK_VERSE;
  const activePlans = (plansResult.data ?? []) as unknown as PlanWithProgress[];

  const displayName = profile?.display_name ?? profile?.full_name ?? "Friend";
  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const streak = profile?.streak_count ?? 0;

  return (
    <div className="min-h-full bg-background pb-2">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-[13px] text-muted-foreground">{greeting}</p>
          <h1 className="text-[24px] font-bold tracking-tight">{firstName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 rounded-full px-2.5 py-1 border border-amber-200/60 dark:border-amber-800/40">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400">{streak}</span>
            </div>
          )}
          <Link href="/app/profile">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                {getInitials(profile?.full_name ?? profile?.email ?? "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* ── Verse of the Day (hero) ── */}
      <div className="px-4 mt-1">
        <div className="bg-[#1C1C1E] dark:bg-[#2C2C2E] rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-1">Verse of the Day</p>
            <p className="text-[13px] text-white/60 font-medium mb-3">{verse.verse_reference}</p>
            <p className="font-serif text-white text-[18px] leading-[1.65]">
              {verse.verse_text}
            </p>
          </div>

          {/* Engagement row */}
          <div className="flex items-center border-t border-white/8 px-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-white/50 active:text-white/80 transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-[13px]">Like</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-white/50 active:text-white/80 transition-colors">
              <Copy className="h-4 w-4" />
              <span className="text-[13px]">Copy</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-white/50 active:text-white/80 transition-colors">
              <Share2 className="h-4 w-4" />
              <span className="text-[13px]">Share</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <Link href="/app/bible" className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-white/50 active:text-white/80 transition-colors">
              <Maximize2 className="h-4 w-4" />
              <span className="text-[13px]">Read</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Your Plans ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="text-[17px] font-bold">Your Plans</h2>
          <Link href="/app/plans" className="text-[13px] text-muted-foreground font-medium flex items-center gap-0.5">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activePlans.length > 0 ? (
          <div className="flex gap-3 pl-5 pr-4 overflow-x-auto pb-1 scrollbar-hide">
            {activePlans.map((progress) => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
              return (
                <Link
                  key={progress.id}
                  href={`/app/plans/${progress.plan_id}`}
                  className="flex-shrink-0 w-[175px] bg-card border border-border rounded-2xl p-4 shadow-sm active:scale-[0.97] transition-transform"
                >
                  <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">Day {progress.current_day} of {plan.duration_days}</p>
                  <h3 className="font-semibold text-[13px] leading-snug mb-3 line-clamp-2">{plan.title}</h3>
                  <Progress value={pct} className="h-1" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">{pct}% complete</p>
                </Link>
              );
            })}
            <Link
              href="/app/plans"
              className="flex-shrink-0 w-[140px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 py-6 active:scale-[0.97] transition-transform"
            >
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[12px] text-muted-foreground text-center leading-snug px-2">Find a plan</p>
            </Link>
          </div>
        ) : (
          <div className="mx-5">
            <Link
              href="/app/plans"
              className="flex items-center gap-4 border border-border rounded-2xl px-4 py-4 active:bg-muted/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[14px]">Start a Reading Plan</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Build a daily Bible habit</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Continue in Bible ── */}
      <div className="mt-6 px-5">
        <h2 className="text-[17px] font-bold mb-3">Continue Reading</h2>
        <Link
          href="/app/bible"
          className="flex items-center gap-4 border border-border rounded-2xl px-4 py-4 bg-card shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[14px]">Open Bible</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">Pick up where you left off</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* ── Guided Prayer ── */}
      <div className="mt-6 px-5 mb-8">
        <h2 className="text-[17px] font-bold mb-3">Guided Prayer</h2>
        <Link
          href="/app/prayer"
          className="flex items-center gap-4 bg-[#1B6CA8] rounded-2xl px-5 py-4 active:opacity-80 transition-opacity"
        >
          <div className="flex-1">
            <p className="font-semibold text-white text-[15px]">Enter into a conversation with your creator.</p>
            <p className="text-white/60 text-[13px] mt-1">Community prayer wall</p>
          </div>
          <ChevronRight className="h-5 w-5 text-white/60" />
        </Link>
      </div>

    </div>
  );
}
