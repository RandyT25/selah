import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle } from "lucide-react";
import type { ReadingPlan, PlanProgress } from "@/types/database";

const COVER_COLORS = [
  "#8B2330", "#276749", "#1B5E72", "#2563A8",
  "#5B4397", "#B45309", "#065F46", "#9D174D",
];

interface Props { params: Promise<{ id: string }> }

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const [planResult, progressResult] = await Promise.all([
    supabase.from("reading_plans").select("*").eq("id", id).single(),
    supabase.from("plan_progress").select("*").eq("plan_id", id).eq("user_id", user.id).single(),
  ]);

  if (!planResult.data) notFound();
  const plan = planResult.data as ReadingPlan;
  const progress = progressResult.data as PlanProgress | null;
  const pct = progress
    ? Math.round((progress.completed_days.length / plan.duration_days) * 100)
    : 0;

  const colorIdx = Math.abs(id.charCodeAt(0) - 65) % COVER_COLORS.length;
  const coverColor = COVER_COLORS[colorIdx];

  // Parse plan content (array of day objects)
  type DayContent = { day: number; title?: string; readings?: string[]; reflection?: string };
  const days: DayContent[] = Array.isArray(plan.content) ? plan.content as DayContent[] : [];

  return (
    <div className="min-h-full bg-white dark:bg-black">

      {/* Back */}
      <div className="px-5 pt-6 pb-2">
        <Link href="/app/plans" className="text-[#888] cursor-pointer inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[14px]">Plans</span>
        </Link>
      </div>

      {/* Cover */}
      <div
        className="mx-5 rounded-3xl h-[140px] flex flex-col justify-end p-5 mb-6"
        style={{ backgroundColor: coverColor }}
      >
        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-1">
          {plan.duration_days} Days · {plan.difficulty}
        </p>
        <h1 className="text-white font-bold text-[22px] leading-snug">{plan.title}</h1>
      </div>

      {/* Progress */}
      {progress && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold">Day {progress.current_day} of {plan.duration_days}</p>
            <p className="text-[13px] text-[#888]">{pct}% complete</p>
          </div>
          <div className="h-1.5 bg-[#F0F0F0] dark:bg-[#222] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: coverColor }} />
          </div>
        </div>
      )}

      {/* Description */}
      {plan.description && (
        <div className="px-5 mb-6">
          <p className="text-[14px] leading-relaxed text-[#555] dark:text-[#AAA]">{plan.description}</p>
        </div>
      )}

      {/* Enroll / Continue CTA */}
      <div className="px-5 mb-6">
        <Link
          href={`/app/plans/${id}/day/${progress?.current_day ?? 1}`}
          className="w-full flex items-center justify-center h-[52px] rounded-2xl font-semibold text-[15px] text-white active:opacity-70 transition-opacity cursor-pointer"
          style={{ backgroundColor: coverColor }}
        >
          {progress ? `Continue — Day ${progress.current_day}` : "Start Plan"}
        </Link>
      </div>

      {/* Day list */}
      {days.length > 0 && (
        <div className="border-t border-[#F0F0F0] dark:border-[#222]">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">
            {plan.duration_days} Days
          </p>
          {days.map((day, i) => {
            const done = progress?.completed_days.includes(day.day);
            return (
              <Link
                key={day.day}
                href={`/app/plans/${id}/day/${day.day}`}
                className={`flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                  i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""
                }`}
              >
                <div className="flex-1">
                  <p className="text-[13px] text-[#888] mb-0.5">Day {day.day}</p>
                  <p className="text-[15px] font-semibold">{day.title ?? `Day ${day.day}`}</p>
                </div>
                {done
                  ? <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: coverColor }} />
                  : <ChevronRight className="h-4 w-4 text-[#CCC] flex-shrink-0" />
                }
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty plan content */}
      {days.length === 0 && (
        <div className="flex flex-col items-center pt-8 pb-16 px-8 text-center">
          <BookOpen className="h-10 w-10 text-[#CCC] mb-4" strokeWidth={1} />
          <p className="text-[15px] text-[#888]">Plan content coming soon</p>
        </div>
      )}

    </div>
  );
}
