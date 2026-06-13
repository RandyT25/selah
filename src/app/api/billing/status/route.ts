import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Plan, SubscriptionStatus } from "@/lib/billing/plans";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    const plan: Plan = (data?.plan as Plan) ?? "free";
    const status: SubscriptionStatus = (data?.status as SubscriptionStatus) ?? "active";

    return NextResponse.json({
      plan,
      status,
      currentPeriodEnd: data?.current_period_end ?? null,
      stripeCustomerId: data?.stripe_customer_id ?? null,
    });
  } catch (e) {
    console.error("[/api/billing/status]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
