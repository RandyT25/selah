import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Devotional } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Devotionals" };

export default async function AdminDevotionalsPage() {
  const supabase = await createClient();

  const { data: raw, count } = await supabase
    .from("devotionals")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const devotionals = (raw ?? []) as Devotional[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Devotionals</h1>
        <p className="text-muted-foreground text-sm mt-1">{count ?? 0} devotionals</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Devotionals</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Read Time</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {devotionals.map((devo) => (
                  <tr key={devo.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium line-clamp-1">{devo.title}</p>
                        {devo.is_featured && (
                          <span className="text-xs text-primary">⭐ Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{devo.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{devo.reading_time_minutes} min</td>
                    <td className="px-4 py-3">{devo.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={devo.is_published ? "default" : "secondary"}>
                        {devo.is_published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {devo.published_at
                        ? new Date(devo.published_at).toLocaleDateString()
                        : "—"}
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
