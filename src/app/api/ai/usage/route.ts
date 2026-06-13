import { NextResponse } from "next/server";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

const FREE_LIMIT  = 10;
const PREMIUM_LIMIT = 9999;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = (sub?.plan === "premium" || sub?.plan === "annual") && sub?.status === "active";
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;

  const rawAdmin = createRawAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await rawAdmin
    .from("ai_usage")
    .select("query_count")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  const queryCount = usage?.query_count ?? 0;

  return NextResponse.json({
    queryCount,
    limit,
    remaining: Math.max(0, limit - queryCount),
    isAtLimit: !isPremium && queryCount >= FREE_LIMIT,
    isUnlimited: isPremium,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
