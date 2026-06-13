import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";
import { getXendit, xenditConfigured } from "@/lib/billing/xendit";
import { requirePaymentsEnabled } from "@/lib/billing/paymentsEnabled";

const Schema = z.object({
  amountIDR:   z.number().int().min(10_000, "Minimum donation is Rp 10.000"),
  message:     z.string().max(500).optional().nullable(),
  isAnonymous: z.boolean().default(false),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://selah-umber.vercel.app";

export async function POST(request: Request) {
  const gate = requirePaymentsEnabled();
  if (gate) return gate;

  try {
    if (!xenditConfigured()) {
      return NextResponse.json({ error: "Xendit is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amountIDR, message, isAnonymous } = parsed.data;

    const { data: profile } = user
      ? await supabase.from("profiles").select("email, display_name, full_name").eq("id", user.id).single()
      : { data: null };

    const xendit = getXendit();
    const externalId = `donation-${user?.id ?? "anon"}-${Date.now()}`;

    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount:      amountIDR,
        payerEmail:  profile?.email ?? user?.email ?? undefined,
        description: message ?? "Mendukung misi Selah — Alkitab gratis untuk semua",
        successRedirectUrl: `${APP_URL}/bibleapp/donate?success=1`,
        failureRedirectUrl: `${APP_URL}/bibleapp/donate`,
        currency: "IDR",
        items: [{
          name:     "Donasi untuk Selah",
          quantity: 1,
          price:    amountIDR,
          category: "Donation",
        }],
        customer: {
          customerId: user?.id ?? "anonymous",
          email:       profile?.email ?? user?.email ?? undefined,
          givenNames:  isAnonymous ? "Anonymous" : (profile?.display_name ?? profile?.full_name ?? undefined),
        },
        metadata: {
          supabase_user_id: user?.id ?? null,
          message: message ?? "",
          is_anonymous: String(isAnonymous),
          provider: "xendit",
        },
        paymentMethods: [
          "CREDIT_CARD", "BCA", "BNI", "BRI", "MANDIRI", "PERMATA",
          "OVO", "DANA", "LINKAJA", "SHOPEEPAY", "QRIS",
        ],
      },
    });

    // Pre-create donation record
    const rawAdmin = createRawAdminClient();
    await rawAdmin.from("donations").insert({
      user_id:      user?.id ?? null,
      amount_cents: Math.round(amountIDR / 15),  // rough USD-cents equivalent for tracking
      currency:     "IDR",
      status:       "pending",
      message:      message ?? null,
      is_anonymous: isAnonymous,
    });

    return NextResponse.json({ url: invoice.invoiceUrl });
  } catch (e) {
    console.error("[/api/billing/xendit/donate]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to process donation" }, { status: 500 });
  }
}
