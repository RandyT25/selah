import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL_PRODUCTION ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer:   sub.stripe_customer_id,
      return_url: `${APP_URL}/bibleapp/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/billing/portal]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
