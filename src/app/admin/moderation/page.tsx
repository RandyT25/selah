import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PrayerRequest } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Moderation" };

type PrayerWithAuthor = PrayerRequest & {
  profiles: { full_name: string | null; email: string } | null;
};

export default async function AdminModerationPage() {
  const supabase = await createClient();

  const { data: raw, count } = await supabase
    .from("prayer_requests")
    .select("*, profiles(full_name, email)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const prayers = (raw ?? []) as unknown as PrayerWithAuthor[];

  const CATEGORY_COLORS: Record<string, string> = {
    healing: "bg-red-100 text-red-700",
    family: "bg-blue-100 text-blue-700",
    work: "bg-green-100 text-green-700",
    relationships: "bg-pink-100 text-pink-700",
    spiritual: "bg-purple-100 text-purple-700",
    financial: "bg-amber-100 text-amber-700",
    other: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Moderation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {count ?? 0} public prayer requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Prayer Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {prayers.map((prayer) => (
              <div key={prayer.id} className="px-4 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[prayer.category] ?? CATEGORY_COLORS.other}`}>
                        {prayer.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {prayer.profiles?.full_name ?? prayer.profiles?.email ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prayer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1">{prayer.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prayer.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        🙏 {prayer.prayer_count} prayers
                      </span>
                      {prayer.is_answered && (
                        <Badge variant="default" className="text-xs bg-green-500">Answered</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {prayers.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No public prayer requests to moderate
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
