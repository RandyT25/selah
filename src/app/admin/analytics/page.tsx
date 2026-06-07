import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, NotebookPen, HandHeart, TrendingUp, Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    usersResult,
    journalResult,
    prayersResult,
    plansResult,
    readingResult,
    eventsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("plan_progress").select("*", { count: "exact", head: true }),
    supabase.from("reading_history").select("*", { count: "exact", head: true }),
    supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const stats = [
    { label: "Total Users", value: usersResult.count ?? 0, icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
    { label: "Journal Entries", value: journalResult.count ?? 0, icon: NotebookPen, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
    { label: "Prayer Requests", value: prayersResult.count ?? 0, icon: HandHeart, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
    { label: "Plan Enrollments", value: plansResult.count ?? 0, icon: BookOpen, color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
    { label: "Chapters Read", value: readingResult.count ?? 0, icon: TrendingUp, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    { label: "Analytics Events", value: eventsResult.data?.length ?? 0, icon: Activity, color: "text-slate-500 bg-slate-50 dark:bg-slate-950/30" },
  ];

  // Tally event types
  const eventTypeCounts: Record<string, number> = {};
  for (const event of eventsResult.data ?? []) {
    eventTypeCounts[event.event_type] = (eventTypeCounts[event.event_type] ?? 0) + 1;
  }
  const topEvents = Object.entries(eventTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide usage overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Event Types (last 100 events)</CardTitle>
        </CardHeader>
        <CardContent>
          {topEvents.length > 0 ? (
            <div className="space-y-3">
              {topEvents.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{type}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[200px]">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${(count / (topEvents[0]?.[1] ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-3 shrink-0">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No analytics events recorded yet. Events are tracked as users interact with the app.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
