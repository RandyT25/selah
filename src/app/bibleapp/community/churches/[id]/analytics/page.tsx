import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, UserCheck, BarChart3, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChurchAnalyticsCharts } from "@/components/churches/ChurchAnalyticsCharts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChurchAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const [churchRes, memberRes] = await Promise.all([
    supabase.from("churches").select("name").eq("id", id).single(),
    supabase.from("church_members").select("role").eq("church_id", id).eq("user_id", user.id).single(),
  ]);

  if (!churchRes.data) notFound();
  if (memberRes.data?.role !== "admin") redirect(`/bibleapp/community/churches/${id}`);

  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? vercelUrl ?? "http://localhost:3000";
  const { data: { session } } = await supabase.auth.getSession();

  let stats: {
    totalMembers: number;
    newMembers30d: number;
    attendanceLast30d: number;
    attendanceByWeek: { week: string; count: number }[];
    membersByMonth: { month: string; count: number }[];
  } | null = null;

  let isPlusError = false;

  try {
    const res = await fetch(`${baseUrl}/api/churches/${id}/analytics`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      cache: "no-store",
    });
    if (res.status === 402) { isPlusError = true; }
    else if (res.ok) stats = await res.json();
  } catch { /* no-op */ }

  if (isPlusError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Lock className="h-10 w-10 mx-auto text-amber-500" />
        <h1 className="text-xl font-bold">Church Analytics requires Church Plus</h1>
        <p className="text-muted-foreground text-sm">Upgrade your church to access detailed analytics.</p>
        <Button variant="gold" asChild>
          <Link href={`/bibleapp/community/churches/${id}?tab=plus`}>Upgrade Church Plus</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/bibleapp/community/churches/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {churchRes.data.name}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Church Analytics</h1>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { icon: Users,     label: "Total Members",      value: stats?.totalMembers ?? "—"      },
          { icon: TrendingUp,label: "New (30 days)",       value: stats?.newMembers30d ?? "—"     },
          { icon: UserCheck, label: "Attendance (30 days)",value: stats?.attendanceLast30d ?? "—" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex gap-3 items-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {stats && (
        <ChurchAnalyticsCharts
          attendanceByWeek={stats.attendanceByWeek}
          membersByMonth={stats.membersByMonth}
        />
      )}
    </div>
  );
}
