import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, day } = await req.json();
  if (!planId || !day) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  // Load existing progress
  const { data: existing } = await admin
    .from("plan_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_id", planId)
    .single();

  if (!existing) {
    // Create new progress row
    const { error } = await admin.from("plan_progress").insert({
      user_id: user.id,
      plan_id: planId,
      current_day: day + 1,
      completed_days: [day],
      is_active: true,
      started_at: new Date().toISOString(),
      last_read_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const completedDays: number[] = existing.completed_days ?? [];
    if (!completedDays.includes(day)) completedDays.push(day);
    const nextDay = Math.max(existing.current_day, day + 1);
    const { error } = await admin.from("plan_progress").update({
      completed_days: completedDays,
      current_day: nextDay,
      last_read_at: new Date().toISOString(),
    }).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Enroll in a plan (start fresh)
export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("plan_progress").upsert({
    user_id: user.id,
    plan_id: planId,
    current_day: 1,
    completed_days: [],
    is_active: true,
    started_at: new Date().toISOString(),
    last_read_at: new Date().toISOString(),
  }, { onConflict: "user_id,plan_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
