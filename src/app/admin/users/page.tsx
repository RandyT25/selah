import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Users" };

type AdminUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
  streak_count: number;
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: raw, count } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, streak_count", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  const users = (raw ?? []) as AdminUser[];

  const ROLE_STYLES: Record<string, string> = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    moderator: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    user: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{count ?? 0} total users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Streak</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{user.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_STYLES[user.role] ?? ROLE_STYLES.user}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.streak_count > 0 ? (
                        <span className="text-amber-600 font-medium">🔥 {user.streak_count}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
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
