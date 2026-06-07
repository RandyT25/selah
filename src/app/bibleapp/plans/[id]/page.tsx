import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, CheckCircle2, Circle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReadingPlan, PlanProgress } from "@/types/database";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("reading_plans").select("title, description").eq("id", id).single();
  const plan = data as Pick<ReadingPlan, "title" | "description"> | null;
  return {
    title: plan?.title ?? "Reading Plan",
    description: plan?.description ?? undefined,
  };
}

type DayReading = {
  day: number;
  title: string;
  passages: string[];
  reflection?: string;
};

export default async function PlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const [planResult, progressResult] = await Promise.all([
    supabase.from("reading_plans").select("*").eq("id", id).eq("is_published", true).single(),
    supabase.from("plan_progress").select("*").eq("plan_id", id).eq("user_id", user.id).single(),
  ]);

  const plan = planResult.data as ReadingPlan | null;
  if (!plan) notFound();

  const progress = progressResult.data as PlanProgress | null;
  const isEnrolled = !!progress;
  const completedDays = new Set<number>(progress?.completed_days ?? []);
  const currentDay = progress?.current_day ?? 1;
  const pct = progress
    ? Math.round((completedDays.size / plan.duration_days) * 100)
    : 0;

  // Parse the plan's reading schedule from the content field
  const dailyReadings: DayReading[] = (() => {
    try {
      return JSON.parse(typeof plan.content === "string" ? plan.content : JSON.stringify(plan.content)) as DayReading[];
    } catch {
      // Fallback: generate placeholder days
      return Array.from({ length: plan.duration_days }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}`,
        passages: [],
      }));
    }
  })();

  const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link href="/bibleapp/plans">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Plans
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        {plan.is_featured && (
          <div className="flex items-center gap-1 text-primary mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Featured Plan</span>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-3">{plan.title}</h1>
        <p className="text-muted-foreground mb-4">{plan.description}</p>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{plan.duration_days} days</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{plan.subscriber_count.toLocaleString()} readers</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[plan.difficulty] ?? ""}`}>
            {plan.difficulty}
          </span>
          {plan.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Progress for enrolled users */}
      {isEnrolled && progress && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">Your Progress</p>
                <p className="text-sm text-muted-foreground">Day {currentDay} of {plan.duration_days}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{pct}%</p>
                <p className="text-xs text-muted-foreground">{completedDays.size} days completed</p>
              </div>
            </div>
            <Progress value={pct} className="h-2" />
            {progress.completed_at && (
              <p className="text-sm text-green-600 font-medium mt-3 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Completed!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enroll CTA */}
      {!isEnrolled && (
        <Card className="mb-8">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Ready to start?</p>
              <p className="text-sm text-muted-foreground">Join {plan.subscriber_count.toLocaleString()} readers on this journey</p>
            </div>
            <EnrollButton planId={plan.id} userId={user.id} />
          </CardContent>
        </Card>
      )}

      {/* Daily Readings */}
      <div>
        <h2 className="text-xl font-bold mb-4">Reading Schedule</h2>
        <div className="space-y-3">
          {dailyReadings.map((day) => {
            const isDone = completedDays.has(day.day);
            const isCurrent = isEnrolled && day.day === currentDay && !isDone;

            return (
              <Card
                key={day.day}
                className={`transition-all ${isCurrent ? "border-primary shadow-sm" : ""} ${isDone ? "opacity-70" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Day {day.day}</span>
                        {isCurrent && <Badge variant="gold" className="text-[10px]">Today</Badge>}
                        {isDone && <span className="text-xs text-green-600 font-medium">Completed</span>}
                      </div>
                      <p className="font-medium text-sm">{day.title}</p>
                      {day.passages.length > 0 && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {day.passages.map(passage => (
                            <Link
                              key={passage}
                              href={`/bible?passage=${encodeURIComponent(passage)}`}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <BookOpen className="h-3 w-3" />
                              {passage}
                            </Link>
                          ))}
                        </div>
                      )}
                      {day.reflection && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{day.reflection}</p>
                      )}
                    </div>

                    {isEnrolled && !isDone && (
                      <MarkCompleteButton planId={plan.id} userId={user.id} day={day.day} completedDays={progress?.completed_days ?? []} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Track your reflections in your journal</p>
        <Button variant="outline" asChild>
          <Link href="/bibleapp/journal/new">Write a Journal Entry</Link>
        </Button>
      </div>
    </div>
  );
}

// Client components for interactive actions
import EnrollButton from "@/components/plans/EnrollButton";
import MarkCompleteButton from "@/components/plans/MarkCompleteButton";
