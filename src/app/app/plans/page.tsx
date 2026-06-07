import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ReadingPlan, PlanProgress } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plans" };

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

const TOPICS = ["Love", "Family", "Anxiety", "Whole Bible", "Prayer", "Faith", "New Believer", "Grief"];

const TOPIC_COLORS = [
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
    <div className="min-h-full bg-background">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[28px] font-bold tracking-tight mb-4">Plans</h1>
        <div className="flex items-center gap-2.5 bg-muted rounded-xl px-4 py-3 w-full">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-[15px] text-muted-foreground">Find plan</span>
        </div>
      </div>

      {/* ── Topic pills ── */}
      <div className="flex gap-2 px-5 overflow-x-auto pb-1 scrollbar-hide mb-5">
        {TOPICS.map((t) => (
          <button
            key={t}
            className="flex-shrink-0 rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-foreground bg-card active:bg-muted transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── My Plans ── */}
      {activePlans.length > 0 && (
        <div className="px-5 mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold">My Plans</h2>
            <span className="text-[13px] text-muted-foreground">{activePlans.length} active</span>
          </div>
          <div className="space-y-3">
            {activePlans.map((progress) => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              const pct = Math.round((progress.completed_days.length / plan.duration_days) * 100);
              return (
                <Link
                  key={progress.id}
                  href={`/app/plans/${progress.plan_id}`}
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px] truncate">{plan.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 mb-2">Day {progress.current_day} of {plan.duration_days}</p>
                    <Progress value={pct} className="h-1" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Featured / Discover ── */}
      {featuredPlans.length > 0 && (
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold">Featured</h2>
            <Link href="/app/plans" className="text-[13px] text-muted-foreground flex items-center gap-0.5">
              See All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featuredPlans.slice(0, 6).map((plan, i) => {
              const enrolled = enrolledIds.has(plan.id);
              const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
              return (
                <Link
                  key={plan.id}
                  href={`/app/plans/${plan.id}`}
                  className="rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-transform"
                >
                  {/* Cover */}
                  <div className="h-[120px] flex items-end p-3" style={{ backgroundColor: color }}>
                    <div>
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">{plan.duration_days} Days</p>
                      <p className="text-white font-bold text-[13px] leading-snug line-clamp-2">{plan.title}</p>
                    </div>
                  </div>
                  {/* Meta */}
                  <div className="bg-card border border-border border-t-0 rounded-b-2xl px-3 py-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground capitalize">{plan.category}</span>
                    <span className="text-[11px] font-semibold text-primary">{enrolled ? "Enrolled" : "Start →"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activePlans.length === 0 && featuredPlans.length === 0 && (
        <div className="mx-5 border border-dashed border-border rounded-2xl p-8 flex flex-col items-center text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-semibold text-[15px]">No plans yet</p>
          <p className="text-[13px] text-muted-foreground mt-1">Check back soon for reading plans</p>
        </div>
      )}

    </div>
  );
}
