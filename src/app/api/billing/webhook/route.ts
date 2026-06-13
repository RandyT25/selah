import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { createAdminClient, createRawAdminClient } from "@/lib/supabase/server";
import type { Plan, SubscriptionStatus } from "@/lib/billing/plans";

// App Router does not pre-parse the body — raw text is available directly.
// Stripe requires the raw body for signature verification.

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    console.warn("[webhook] Stripe not configured — skipping");
    return NextResponse.json({ received: true });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[webhook] STRIPE_WEBHOOK_SECRET not set — skipping");
    return NextResponse.json({ received: true });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    console.error("[webhook] Signature verification failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin    = createAdminClient();
  const rawAdmin = createRawAdminClient();

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (session.mode === "subscription" && userId && session.customer) {
          await admin.from("subscriptions").upsert({
            user_id:            userId,
            stripe_customer_id: session.customer as string,
          }, { onConflict: "user_id" });
        }

        if (session.mode === "payment" && session.payment_intent) {
          await rawAdmin.from("donations")
            .update({ status: "succeeded" })
            .eq("stripe_payment_intent_id", session.payment_intent as string);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        const plan: Plan = sub.items.data[0]?.price.id === process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID
          ? "annual"
          : "premium";
        const status = sub.status as SubscriptionStatus;

        // current_period_start / current_period_end are on the subscription object;
        // cast via any since generated types lag behind the latest Stripe SDK version.
        const rawSub = sub as unknown as Record<string, unknown>;
        const periodStart = typeof rawSub.current_period_start === "number"
          ? new Date(rawSub.current_period_start as number * 1000).toISOString()
          : null;
        const periodEnd = typeof rawSub.current_period_end === "number"
          ? new Date(rawSub.current_period_end as number * 1000).toISOString()
          : null;
        const trialEnd = typeof rawSub.trial_end === "number"
          ? new Date(rawSub.trial_end as number * 1000).toISOString()
          : null;
        const canceledAt = typeof rawSub.canceled_at === "number"
          ? new Date(rawSub.canceled_at as number * 1000).toISOString()
          : null;

        await admin.from("subscriptions").upsert({
          user_id:                userId,
          plan,
          status,
          stripe_subscription_id: sub.id,
          current_period_start:   periodStart,
          current_period_end:     periodEnd,
          trial_end:              trialEnd,
          canceled_at:            canceledAt,
        }, { onConflict: "user_id" });

        await admin.from("profiles")
          .update({ is_premium: status === "active" && (plan === "premium" || plan === "annual") })
          .eq("id", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        await admin.from("subscriptions").update({
          plan:        "free",
          status:      "canceled",
          canceled_at: new Date().toISOString(),
        }).eq("user_id", userId);

        await admin.from("profiles").update({ is_premium: false }).eq("id", userId);
        break;
      }

      case "invoice.payment_succeeded":
        // Period extension handled by subscription.updated — nothing extra needed
        break;

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;
        await admin.from("subscriptions").update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await rawAdmin.from("donations").update({ status: "succeeded" })
          .eq("stripe_payment_intent_id", pi.id);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (e) {
    console.error("[webhook] Handler error:", e instanceof Error ? e.message : e);
    // Return 200 so Stripe doesn't retry — error is logged for investigation
  }

  return NextResponse.json({ received: true });
}
