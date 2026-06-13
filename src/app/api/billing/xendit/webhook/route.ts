import { NextResponse } from "next/server";
import { createAdminClient, createRawAdminClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/billing/plans";

// Xendit sends webhook events with a callback token in the header
// https://developers.xendit.co/api-reference/#callbacks

export async function POST(request: Request) {
  const callbackToken = request.headers.get("x-callback-token");
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (expectedToken && callbackToken !== expectedToken) {
    console.warn("[xendit webhook] Invalid callback token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin    = createAdminClient();
  const rawAdmin = createRawAdminClient();

  try {
    const status  = body.status as string;
    const metadata = body.metadata as Record<string, string> | undefined;
    const userId  = metadata?.supabase_user_id;

    // Invoice paid — provision subscription
    if (status === "PAID" || status === "SETTLED") {
      const externalId = body.external_id as string ?? "";

      // Subscription payment
      if (externalId.startsWith("selah-") && userId && metadata?.plan) {
        const plan: Plan = metadata.plan === "annual" ? "annual" : "premium";
        const now = new Date();
        const periodEnd = new Date(now);
        if (plan === "annual") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await admin.from("subscriptions").upsert({
          user_id:             userId,
          plan,
          status:              "active",
          current_period_start: now.toISOString(),
          current_period_end:   periodEnd.toISOString(),
        }, { onConflict: "user_id" });

        await admin.from("profiles")
          .update({ is_premium: true })
          .eq("id", userId);

        console.log(`[xendit webhook] Subscription activated for ${userId}, plan=${plan}`);
      }

      // Donation payment
      if (externalId.startsWith("donation-")) {
        await rawAdmin.from("donations")
          .update({ status: "succeeded" })
          .eq("user_id", userId ?? "");

        console.log(`[xendit webhook] Donation received`);
      }
    }

    // Invoice expired or failed
    if (status === "EXPIRED" && body.external_id && body.external_id !== "donation") {
      const externalId = body.external_id as string;
      if (externalId.startsWith("selah-") && userId) {
        await admin.from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", userId)
          .eq("status", "active");
      }
    }

  } catch (e) {
    console.error("[xendit webhook] Handler error:", e instanceof Error ? e.message : e);
  }

  // Always return 200 so Xendit doesn't retry
  return NextResponse.json({ received: true });
}
