import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReadingPlan, PlanProgress } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reading Plans" };

type ProgressWithPlan = PlanProgress & { reading_plans: ReadingPlan | null };

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [plansResult, progressResult] = await Promise.all([
    supabase.from("reading_plans").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("subscriber_count", { ascending: false }),
    user ? supabase.from("plan_progress").select("*, reading_plans(*)").eq("user_id", user.id) : Promise.resolve({ data: [] }),
  ]);

  const plans = (plansResult.data ?? []) as ReadingPlan[];
  const myProgress = (progressResult.data ?? []) as unknown as ProgressWithPlan[];

  const activePlans = myProgress.filter(p => p.is_active);
  const completedPlans = myProgress.filter(p => p.completed_at);
  const enrolledPlanIds = new Set<string>(myProgress.map(p => p.plan_id));

  const featured = plans.filter(p => p.is_featured);

  const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const PlanCard = ({ plan, progress }: { plan: ReadingPlan; progress?: ProgressWithPlan }) => {
    const isEnrolled = enrolledPlanIds.has(plan.id);
    const pct = progress ? Math.round((progress.completed_days.length / plan.duration_days) * 100) : 0;

    return (
      <Card className="card-hover h-full flex flex-col">
        <CardContent className="p-5 flex-1 flex flex-col">
          {plan.is_featured && (
            <div className="flex items-center gap-1 text-primary mb-2">
              <Star className="h-3.5 w-3.5 fill-primary" />
              <span className="text-xs font-semibold">Featured</span>
            </div>
          )}
          <h3 className="font-semibold text-base mb-1 line-clamp-2">{plan.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{plan.description}</p>

          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{plan.duration_days} days</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{plan.subscriber_count.toLocaleString()}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${DIFFICULTY_COLORS[plan.difficulty] ?? ""}`}>
              {plan.difficulty}
            </span>
          </div>

          {isEnrolled && progress && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Day {progress.current_day}</span>
                <span className="font-medium text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )}

          <Button size="sm" variant={isEnrolled ? "outline" : "gold"} className="w-full mt-auto" asChild>
            <Link href={`/plans/${plan.id}`}>
              {isEnrolled ? "Continue Reading" : "Start Plan"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reading Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Structured journeys through Scripture</p>
        </div>
      </div>

      <Tabs defaultValue="discover">
        <TabsList className="mb-6">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="active">
            Active
            {activePlans.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full">
                {activePlans.length}
              </span>
            )}
          </TabsTrigger>
          {completedPlans.length > 0 && <TabsTrigger value="completed">Completed</TabsTrigger>}
        </TabsList>

        <TabsContent value="discover">
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Featured Plans</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map(plan => (
                  <PlanCard key={plan.id} plan={plan} progress={myProgress.find(p => p.plan_id === plan.id)} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">All Plans</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} progress={myProgress.find(p => p.plan_id === plan.id)} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="active">
          {activePlans.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {activePlans.map(progress => {
                const plan = progress.reading_plans;
                if (!plan) return null;
                return <PlanCard key={progress.id} plan={plan} progress={progress} />;
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No active plans</h3>
              <p className="text-muted-foreground text-sm">Start a reading plan to track your progress</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid sm:grid-cols-2 gap-4">
            {completedPlans.map(progress => {
              const plan = progress.reading_plans;
              if (!plan) return null;
              return <PlanCard key={progress.id} plan={plan} progress={progress} />;
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
