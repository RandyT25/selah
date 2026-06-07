import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import type { ReadingPlan, PlanProgress } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plans" };

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

const COVER_COLORS = [
  "#8B2330", "#276749", "#1B5E72", "#2563A8",
  "#5B4397", "#B45309", "#065F46", "#9D174D",
];

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [activePlansResult, featuredPlansResult] = await Promise.all([
    supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id).eq("is_active", true),
    supabase.from("reading_plans").select("*").eq("is_published", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(10),
  ]);

  const activePlans = (activePlansResult.data ?? []) as unknown as PlanWithProgress[];
  const featuredPlans = (featuredPlansResult.data ?? []) as ReadingPlan[];
  const enrolledIds = new Set(activePlans.map((p) => p.plan_id));

  return (
    <div className="min-h-full bg-white dark:bg-black">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-[28px] font-bold tracking-tight">Plans</h1>
      </div>

      {/* ── My Plans ── */}
      {activePlans.length > 0 && (
        <div className="border-t border-[#F0F0F0] dark:border-[#222]">
          <div className="flex items-center justify-between px-5 pt-4 pb-1">
            <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em]">My Plans</p>
            <p className="text-[11px] text-[#888]">{activePlans.length} active</p>
          </div>
          {activePlans.map((progress, i) => {
            const plan = progress.reading_plans;
            if (!plan) return null;
            const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
            return (
              <Link
                key={progress.id}
                href={`/app/plans/${progress.plan_id}`}
                className={`flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                  i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold truncate mb-0.5">{plan.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-[#F0F0F0] dark:bg-[#333] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111] dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-[#888] flex-shrink-0">Day {progress.current_day} · {pct}%</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#CCC] ml-4 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Featured ── */}
      {featuredPlans.length > 0 && (
        <div className="border-t border-[#F0F0F0] dark:border-[#222] pt-4 pb-28">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 mb-3">Featured</p>
          {featuredPlans.map((plan, i) => {
            const enrolled = enrolledIds.has(plan.id);
            const color = COVER_COLORS[i % COVER_COLORS.length];
            return (
              <Link
                key={plan.id}
                href={`/app/plans/${plan.id}`}
                className={`flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                  i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""
                }`}
              >
                {/* Color dot */}
                <div className="h-10 w-10 rounded-xl flex-shrink-0 mr-4" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold truncate">{plan.title}</p>
                  <p className="text-[12px] text-[#888] mt-0.5">
                    {plan.duration_days} days
                    {plan.category ? ` · ${plan.category}` : ""}
                  </p>
                </div>
                <span className="text-[12px] text-[#888] ml-3 flex-shrink-0">
                  {enrolled ? "Enrolled" : "Start →"}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {activePlans.length === 0 && featuredPlans.length === 0 && (
        <div className="px-5 pt-16 flex flex-col items-center text-center">
          <BookOpen className="h-10 w-10 text-[#CCC] mb-4" strokeWidth={1} />
          <p className="font-semibold text-[17px]">No plans yet</p>
          <p className="text-[14px] text-[#888] mt-1">Check back soon</p>
        </div>
      )}

    </div>
  );
}
