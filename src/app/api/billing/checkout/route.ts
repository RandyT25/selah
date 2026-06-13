import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { getPriceId } from "@/lib/billing/plans";

const Schema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL_PRODUCTION ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const stripe = getStripe();
    const admin = createAdminClient();

    // Get or create Stripe customer
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id, plan, status")
      .eq("user_id", user.id)
      .single();

    // Already on a paid plan
    if (sub?.plan !== "free" && sub?.status === "active") {
      return NextResponse.json({ error: "You already have an active subscription." }, { status: 400 });
    }

    let customerId = sub?.stripe_customer_id ?? null;
    if (!customerId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email, full_name, display_name")
        .eq("id", user.id)
        .single();

      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? undefined,
        name:  profile?.full_name ?? profile?.display_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await admin
        .from("subscriptions")
        .upsert({ user_id: user.id, stripe_customer_id: customerId }, { onConflict: "user_id" });
    }

    const priceId = getPriceId(parsed.data.plan);
    const session = await stripe.checkout.sessions.create({
      customer:            customerId,
      mode:                "subscription",
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${APP_URL}/bibleapp/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:          `${APP_URL}/bibleapp/upgrade`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/billing/checkout]", e instanceof Error ? e.message : e);
    const msg = e instanceof Error ? e.message : "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
