import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReadingPlan } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Reading Plans" };

export default async function AdminPlansPage() {
  const supabase = await createClient();

  const { data: raw, count } = await supabase
    .from("reading_plans")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const plans = (raw ?? []) as ReadingPlan[];

  const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Reading Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">{count ?? 0} plans</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Plans</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Subscribers</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium line-clamp-1">{plan.title}</p>
                        {plan.is_featured && (
                          <span className="text-xs text-primary">⭐ Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{plan.duration_days} days</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[plan.difficulty] ?? ""}`}>
                        {plan.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">{plan.subscriber_count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={plan.is_published ? "default" : "secondary"}>
                        {plan.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(plan.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
