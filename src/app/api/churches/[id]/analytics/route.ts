import { NextResponse } from "next/server";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: churchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberRes = await supabase
    .from("church_members").select("role").eq("church_id", churchId).eq("user_id", user.id).single();
  if (memberRes.data?.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const raw = createRawAdminClient();
  const { data: sub } = await raw
    .from("church_subscriptions")
    .select("plan, status")
    .eq("church_id", churchId)
    .maybeSingle();
  if (sub?.plan !== "plus" || sub?.status !== "active") {
    return NextResponse.json({ error: "Church Plus required" }, { status: 402 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [membersRes, attendanceRes] = await Promise.all([
    supabase
      .from("church_members")
      .select("id, joined_at")
      .eq("church_id", churchId),

    raw
      .from("church_attendance")
      .select("checked_in_at, event_id")
      .eq("church_id", churchId)
      .gte("checked_in_at", thirtyDaysAgo.toISOString()),
  ]);

  const allMembers = membersRes.data ?? [];
  const recentAttendance = attendanceRes.data ?? [];
  const newMembers30d = allMembers.filter(
    (m) => new Date(m.joined_at) >= thirtyDaysAgo
  ).length;

  // Build 8-week attendance buckets
  const getWeekStart = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d.toISOString().slice(0, 10);
  };

  const weeks: { week: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeks.push({ week: getWeekStart(d.toISOString()), count: 0 });
  }

  for (const row of recentAttendance) {
    const ws = getWeekStart(row.checked_in_at);
    const bucket = weeks.find((w) => w.week === ws);
    if (bucket) bucket.count++;
  }

  const membersByMonth: Record<string, number> = {};
  for (const m of allMembers) {
    const month = m.joined_at.slice(0, 7);
    membersByMonth[month] = (membersByMonth[month] ?? 0) + 1;
  }

  return NextResponse.json({
    totalMembers:      allMembers.length,
    newMembers30d,
    attendanceLast30d: recentAttendance.length,
    attendanceByWeek:  weeks,
    membersByMonth: Object.entries(membersByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count })),
  }, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
