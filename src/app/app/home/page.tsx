import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Share2, Heart, Copy, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true).limit(3),
  ]);

  const profile = profileResult.data as Profile | null;
  const verse = (verseResult.data as VerseOfDay | null) ?? FALLBACK_VERSE;
  const activePlans = (plansResult.data ?? []) as unknown as PlanWithProgress[];

  const firstName = (profile?.display_name ?? profile?.full_name ?? "Friend").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full bg-white dark:bg-black">

      {/* ── Greeting ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div>
          <p className="text-[13px] text-[#888]">{greeting}</p>
          <h1 className="text-[26px] font-bold tracking-tight leading-tight">{firstName}</h1>
        </div>
        <Link href="/app/profile">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#F0F0F0] dark:bg-[#222] text-[#333] dark:text-white text-sm font-bold">
              {getInitials(profile?.full_name ?? profile?.email ?? "U")}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* ── Verse of the Day ── */}
      <div className="px-5 mb-8">
        <div className="bg-[#111] dark:bg-[#1A1A1A] rounded-3xl px-6 pt-6 pb-5">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">Verse of the Day</p>
          <p className="text-[13px] text-white/50 mb-4">{verse.verse_reference}</p>
          <p className="font-serif text-white text-[19px] leading-[1.7]">{verse.verse_text}</p>
          <div className="flex items-center gap-0 mt-5 border-t border-white/8 pt-4 -mx-1">
            {[
              { icon: Heart, label: "Like" },
              { icon: Copy, label: "Copy" },
              { icon: Share2, label: "Share" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex-1 flex items-center justify-center gap-1.5 py-1 text-white/40 active:text-white/70 transition-colors cursor-pointer">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="text-[12px]">{label}</span>
              </button>
            ))}
            <Link href="/app/bible" className="flex-1 flex items-center justify-center gap-1.5 py-1 text-white/40 active:text-white/70 transition-colors cursor-pointer">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="text-[12px]">Read</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Your Plans ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between px-5 mb-1">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em]">Your Plans</p>
          <Link href="/app/plans" className="text-[12px] text-[#888] cursor-pointer">See All</Link>
        </div>

        {activePlans.length > 0 ? (
          <div>
            {activePlans.map((progress, i) => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
              return (
                <Link
                  key={progress.id}
                  href={`/app/plans/${progress.plan_id}`}
                  className={`flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer ${i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate mb-0.5">{plan.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-[#F0F0F0] dark:bg-[#222] rounded-full overflow-hidden">
                        <div className="h-full bg-[#111] dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#888] flex-shrink-0">Day {progress.current_day} · {pct}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#CCC] ml-3 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <Link href="/app/plans" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer">
            <p className="flex-1 text-[15px] text-[#888]">Find a reading plan</p>
            <ChevronRight className="h-4 w-4 text-[#CCC]" />
          </Link>
        )}
      </div>

      {/* ── Continue Reading ── */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222]">
        <Link href="/app/bible" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Continue Reading</p>
            <p className="text-[15px] font-semibold">Open Bible</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>
      </div>

      {/* ── Prayer ── */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222]">
        <Link href="/app/prayer" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Community</p>
            <p className="text-[15px] font-semibold">Prayer Wall</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>
      </div>

      {/* ── Journal ── */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222]">
        <Link href="/app/journal" className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">My Reflections</p>
            <p className="text-[15px] font-semibold">Journal</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[#CCC]" />
        </Link>
      </div>

    </div>
  );
}
