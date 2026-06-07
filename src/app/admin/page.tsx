import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, NotebookPen, HandHeart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Selah" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: planCount },
    { count: journalCount },
    { count: prayerCount },
    { count: devotionalCount },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reading_plans").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }),
    supabase.from("prayer_requests").select("*", { count: "exact", head: true }),
    supabase.from("devotionals").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("profiles").select("id, full_name, email, created_at, role").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Users", value: userCount ?? 0, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { label: "Reading Plans", value: planCount ?? 0, icon: BookOpen, color: "text-green-600 bg-green-50 dark:bg-green-950/30" },
    { label: "Journal Entries", value: journalCount ?? 0, icon: NotebookPen, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { label: "Prayer Requests", value: prayerCount ?? 0, icon: HandHeart, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/30" },
    { label: "Devotionals", value: devotionalCount ?? 0, icon: TrendingUp, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentUsers?.map((user) => (
                <tr key={user.id}>
                  <td className="py-2.5">{user.full_name ?? "—"}</td>
                  <td className="py-2.5 text-muted-foreground">{user.email}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
