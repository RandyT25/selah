import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getXendit, xenditConfigured, XENDIT_PRICES } from "@/lib/billing/xendit";

const Schema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://selah-umber.vercel.app";

export async function POST(request: Request) {
  try {
    if (!xenditConfigured()) {
      return NextResponse.json({ error: "Xendit is not configured yet." }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const { plan } = parsed.data;
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, display_name, full_name")
      .eq("id", user.id)
      .single();

    const amountIDR = plan === "annual" ? XENDIT_PRICES.premium_annual : XENDIT_PRICES.premium_monthly;
    const planLabel = plan === "annual" ? "Selah Premium Tahunan" : "Selah Premium Bulanan";
    const xendit = getXendit();

    // Create Xendit Invoice (supports GoPay, OVO, DANA, bank transfer, QRIS, cards)
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId:  `selah-${user.id}-${plan}-${Date.now()}`,
        amount:      amountIDR,
        payerEmail:  profile?.email ?? user.email ?? undefined,
        description: planLabel,
        successRedirectUrl: `${APP_URL}/bibleapp/upgrade/success?provider=xendit`,
        failureRedirectUrl: `${APP_URL}/bibleapp/upgrade`,
        currency:    "IDR",
        items: [{
          name:     planLabel,
          quantity: 1,
          price:    amountIDR,
          category: "Subscription",
        }],
        customer: {
          customerId: user.id,
          email:       profile?.email ?? user.email ?? undefined,
          givenNames:  profile?.display_name ?? profile?.full_name ?? undefined,
        },
        metadata: {
          supabase_user_id: user.id,
          plan,
          provider: "xendit",
        },
        // Enable all Indonesian payment methods
        paymentMethods: [
          "CREDIT_CARD", "BCA", "BNI", "BRI", "MANDIRI", "PERMATA",
          "OVO", "DANA", "LINKAJA", "SHOPEEPAY", "QRIS",
        ],
      },
    });

    return NextResponse.json({ url: invoice.invoiceUrl });
  } catch (e) {
    console.error("[/api/billing/xendit/checkout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
