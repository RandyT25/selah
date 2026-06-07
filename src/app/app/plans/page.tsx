import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronRight, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ReadingPlan, PlanProgress } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plans" };

type PlanWithProgress = PlanProgress & { reading_plans: ReadingPlan | null };

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

  const categoryColor: Record<string, string> = {
    "Foundations": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Devotional": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Study": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Prayer": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-2xl border-b border-border/30 px-4 pt-4 pb-3">
        <h1 className="text-[22px] font-bold">Plans</h1>
      </div>

      <div className="px-4 mt-5">
        {/* ── Active Plans ── */}
        {activePlans.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold">My Plans</h2>
              <span className="text-xs text-muted-foreground">{activePlans.length} active</span>
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
                    className="flex items-center gap-4 bg-card border border-border rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{plan.title}</p>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="text-[11px] text-muted-foreground">Day {progress.current_day} of {plan.duration_days}</span>
                        <span className="text-[11px] font-semibold text-primary">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Featured Plans ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold">Featured Plans</h2>
          </div>

          {featuredPlans.length > 0 ? (
            <div className="space-y-3">
              {featuredPlans.map((plan) => {
                const enrolled = enrolledIds.has(plan.id);
                return (
                  <Link
                    key={plan.id}
                    href={`/app/plans/${plan.id}`}
                    className="block bg-card border border-border rounded-3xl overflow-hidden shadow-sm active:scale-[0.99] transition-transform"
                  >
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[plan.category] ?? "bg-muted text-muted-foreground"}`}>
                            {plan.category}
                          </span>
                          <h3 className="font-bold text-white text-[15px] mt-2 leading-snug">{plan.title}</h3>
                        </div>
                        {enrolled && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] ml-2 flex-shrink-0">
                            Enrolled
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">{plan.duration_days} days</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className="text-xs capitalize">{plan.difficulty}</span>
                        </div>
                      </div>
                      <span className="text-primary text-xs font-semibold">
                        {enrolled ? "Continue →" : "Start →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-semibold">No plans available yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for new reading plans</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
