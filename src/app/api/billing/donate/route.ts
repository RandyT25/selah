import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { requirePaymentsEnabled } from "@/lib/billing/paymentsEnabled";

const Schema = z.object({
  amountCents: z.number().int().min(100, "Minimum donation is $1").max(1_000_000),
  currency:    z.string().length(3).default("USD"),
  message:     z.string().max(500).optional().nullable(),
  isAnonymous: z.boolean().default(false),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL_PRODUCTION ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const gate = requirePaymentsEnabled();
  if (gate) return gate;

  try {
    if (!stripeConfigured()) {
      return NextResponse.json({ error: "Billing is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amountCents, currency, message, isAnonymous } = parsed.data;
    const stripe = getStripe();
    const admin = createRawAdminClient();

    // Create a Stripe Checkout session for the donation
    const session = await stripe.checkout.sessions.create({
      mode:     "payment",
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name:        "Support Selah",
            description: message ?? "Thank you for supporting Selah's mission",
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      success_url: `${APP_URL}/bibleapp/donate?success=1`,
      cancel_url:  `${APP_URL}/bibleapp/donate`,
      metadata: {
        supabase_user_id: user?.id ?? "anonymous",
        message:          message ?? "",
        is_anonymous:     String(isAnonymous),
      },
    });

    // Pre-create the donation record (pending) so we can track it
    if (session.payment_intent) {
      await admin.from("donations").insert({
        user_id:                  user?.id ?? null,
        amount_cents:             amountCents,
        currency,
        stripe_payment_intent_id: session.payment_intent as string,
        status:                   "pending",
        message:                  message ?? null,
        is_anonymous:             isAnonymous,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[/api/billing/donate]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
