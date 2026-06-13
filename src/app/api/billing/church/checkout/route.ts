import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient, createRawAdminClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { getChurchPlusPriceId } from "@/lib/billing/plans";

const Schema = z.object({
  churchId: z.string().uuid(),
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
      return NextResponse.json({ error: "Invalid church id" }, { status: 400 });
    }

    const { churchId } = parsed.data;
    const admin    = createAdminClient();
    const rawAdmin = createRawAdminClient();

    // Verify user is admin of this church
    const { data: member } = await admin
      .from("church_members")
      .select("role")
      .eq("church_id", churchId)
      .eq("user_id", user.id)
      .single();

    if (member?.role !== "admin") {
      return NextResponse.json({ error: "Only church admins can upgrade." }, { status: 403 });
    }

    // Get or create Stripe customer for this church (table not yet in generated types)
    const { data: churchSub } = await rawAdmin
      .from("church_subscriptions")
      .select("stripe_customer_id, plan, status")
      .eq("church_id", churchId)
      .maybeSingle();

    if (churchSub?.plan === "plus" && churchSub?.status === "active") {
      return NextResponse.json({ error: "This church already has Church Plus." }, { status: 400 });
    }

    let customerId: string | null = churchSub?.stripe_customer_id ?? null;
    if (!customerId) {
      const { data: church } = await admin
        .from("churches")
        .select("name")
        .eq("id", churchId)
        .single();

      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: profile?.email ?? undefined,
        name:  church?.name ?? undefined,
        metadata: { church_id: churchId, admin_user_id: user.id },
      });
      customerId = customer.id;

      await rawAdmin.from("church_subscriptions")
        .upsert({ church_id: churchId, stripe_customer_id: customerId }, { onConflict: "church_id" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       "subscription",
      line_items: [{ price: getChurchPlusPriceId(), quantity: 1 }],
      success_url: `${APP_URL}/bibleapp/community/churches/${churchId}?upgraded=1`,
      cancel_url:  `${APP_URL}/bibleapp/community/churches/${churchId}`,
      subscription_data: {
        metadata: { church_id: churchId },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/billing/church/checkout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
