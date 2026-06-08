"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { ReadingPlan, PlanProgress } from "@/types/database";

const bookSlug = (ref: string) => {
  const match = ref.match(/^(.+?)\s+(\d+)/);
  if (!match) return null;
  return { slug: match[1].toLowerCase().replace(/\s+/g, "-"), chapter: parseInt(match[2]) };
};

type DayContent = { day: number; title?: string; readings?: string[]; reflection?: string };

export default function PlanDayPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const dayNum = parseInt(params.day as string);

  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/app/login"); return; }

      const [planRes, progressRes] = await Promise.all([
        supabase.from("reading_plans").select("*").eq("id", planId).single(),
        supabase.from("plan_progress").select("*").eq("plan_id", planId).eq("user_id", user.id).single(),
      ]);

      if (!planRes.data) { router.push("/app/plans"); return; }
      setPlan(planRes.data as ReadingPlan);
      setProgress(progressRes.data as PlanProgress | null);
      setLoading(false);
    };
    load();
  }, [planId, router]);

  const days: DayContent[] = Array.isArray(plan?.content) ? plan!.content as DayContent[] : [];
  const dayContent = days.find(d => d.day === dayNum) ?? { day: dayNum };
  const isCompleted = progress?.completed_days?.includes(dayNum) ?? false;
  const totalDays = plan?.duration_days ?? 1;

  const handleMarkComplete = async () => {
    if (isMarked || marking) return;
    setMarking(true);
    try {
      const res = await fetch("/api/plan/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, day: dayNum }),
      });
      if (!res.ok) throw new Error();
      setProgress(prev => {
        if (!prev) return prev;
        const days = [...(prev.completed_days ?? [])];
        if (!days.includes(dayNum)) days.push(dayNum);
        return { ...prev, completed_days: days, current_day: Math.max(prev.current_day, dayNum + 1) };
      });
      toast.success("Day complete!");
      if (dayNum < totalDays) {
        setTimeout(() => router.push(`/app/plans/${planId}/day/${dayNum + 1}`), 800);
      } else {
        setTimeout(() => router.push(`/app/plans/${planId}`), 800);
      }
    } catch {
      toast.error("Couldn't save progress");
    } finally {
      setMarking(false);
    }
  };

  const isMarked = progress?.completed_days?.includes(dayNum) ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E0E0E0] border-t-[#111] dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-32">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href={`/app/plans/${planId}`} className="text-[#888] cursor-pointer flex items-center gap-1">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-[14px]">{plan?.title}</span>
        </Link>
        <span className="text-[13px] text-[#888] font-medium">Day {dayNum} of {totalDays}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 px-5 mb-6 overflow-x-auto scrollbar-hide">
        {Array.from({ length: Math.min(totalDays, 40) }, (_, i) => i + 1).map(d => {
          const done = progress?.completed_days?.includes(d) ?? false;
          const current = d === dayNum;
          return (
            <Link key={d} href={`/app/plans/${planId}/day/${d}`}>
              <div className={`h-2 rounded-full flex-shrink-0 transition-all ${
                done ? "bg-[#111] dark:bg-white w-4" :
                current ? "bg-[#888] w-4" :
                "bg-[#E0E0E0] dark:bg-[#333] w-2"
              }`} />
            </Link>
          );
        })}
      </div>

      {/* Day title */}
      <div className="px-5 mb-6">
        <p className="text-[11px] font-bold text-[#888] uppercase tracking-[0.15em] mb-1">Day {dayNum}</p>
        <h1 className="text-[26px] font-bold tracking-tight leading-tight">
          {dayContent.title ?? `Day ${dayNum}`}
        </h1>
      </div>

      {/* Readings */}
      {(dayContent.readings ?? []).length > 0 && (
        <div className="px-5 mb-6">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Scripture</p>
          <div className="space-y-2">
            {(dayContent.readings ?? []).map((ref, i) => {
              const parsed = bookSlug(ref);
              return (
                <Link
                  key={i}
                  href={parsed ? `/app/bible/${parsed.slug}/${parsed.chapter}` : "/app/bible"}
                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#1A1A1A] active:opacity-70 transition-opacity cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-[#888]" strokeWidth={1.5} />
                    <span className="text-[15px] font-medium">{ref}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#CCC]" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflection */}
      {dayContent.reflection && (
        <div className="px-5 mb-6">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Reflection</p>
          <p className="text-[16px] leading-[1.75] text-[#333] dark:text-[#BBB]">{dayContent.reflection}</p>
        </div>
      )}

      {/* Empty day content */}
      {!dayContent.reflection && (dayContent.readings ?? []).length === 0 && (
        <div className="px-5 mb-6">
          <div className="rounded-2xl bg-[#F5F5F5] dark:bg-[#1A1A1A] p-6 text-center">
            <BookOpen className="h-8 w-8 text-[#CCC] mx-auto mb-3" strokeWidth={1} />
            <p className="text-[15px] text-[#888]">Day content coming soon</p>
          </div>
        </div>
      )}

      {/* Bottom nav + complete */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-[#F0F0F0] dark:border-[#222]"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-center gap-3 px-5 pt-3 pb-2">
          {dayNum > 1 ? (
            <Link href={`/app/plans/${planId}/day/${dayNum - 1}`}
              className="h-12 w-12 flex items-center justify-center rounded-full border border-[#E0E0E0] dark:border-[#333] active:opacity-70 transition-opacity cursor-pointer">
              <ChevronLeft className="h-5 w-5 text-[#666] dark:text-[#AAA]" />
            </Link>
          ) : <div className="h-12 w-12" />}

          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className={`flex-1 h-12 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isMarked
                ? "bg-[#F0F0F0] dark:bg-[#222] text-[#888]"
                : "bg-[#111] dark:bg-white text-white dark:text-black active:opacity-70"
            }`}
          >
            {isMarked
              ? <><CheckCircle className="h-4 w-4" /> Complete</>
              : marking
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Circle className="h-4 w-4" /> Mark Complete</>
            }
          </button>

          {dayNum < totalDays ? (
            <Link href={`/app/plans/${planId}/day/${dayNum + 1}`}
              className="h-12 w-12 flex items-center justify-center rounded-full border border-[#E0E0E0] dark:border-[#333] active:opacity-70 transition-opacity cursor-pointer">
              <ChevronRight className="h-5 w-5 text-[#666] dark:text-[#AAA]" />
            </Link>
          ) : <div className="h-12 w-12" />}
        </div>
      </div>
    </div>
  );
}
