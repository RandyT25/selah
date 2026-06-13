import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";
import { getXendit, xenditConfigured, XENDIT_PRICES } from "@/lib/billing/xendit";

const Schema = z.object({ churchId: z.string().uuid() });

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
    if (!parsed.success) return NextResponse.json({ error: "Invalid church id" }, { status: 400 });

    const { churchId } = parsed.data;
    const adminCheck = await supabase
      .from("church_members").select("role").eq("church_id", churchId).eq("user_id", user.id).single();
    if (adminCheck.data?.role !== "admin") {
      return NextResponse.json({ error: "Only church admins can upgrade." }, { status: 403 });
    }

    const [churchRes, profileRes] = await Promise.all([
      supabase.from("churches").select("name").eq("id", churchId).single(),
      supabase.from("profiles").select("email, display_name, full_name").eq("id", user.id).single(),
    ]);

    const raw = createRawAdminClient();
    const { data: churchSub } = await raw
      .from("church_subscriptions")
      .select("plan, status")
      .eq("church_id", churchId)
      .maybeSingle();

    if (churchSub?.plan === "plus" && churchSub?.status === "active") {
      return NextResponse.json({ error: "Church Plus already active." }, { status: 400 });
    }

    const xendit = getXendit();
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId:  `church-plus-${churchId}-${Date.now()}`,
        amount:      XENDIT_PRICES.church_plus,
        payerEmail:  profileRes.data?.email ?? user.email ?? undefined,
        description: `Church Plus — ${churchRes.data?.name ?? "Gereja"}`,
        successRedirectUrl: `${APP_URL}/bibleapp/community/churches/${churchId}?upgraded=1`,
        failureRedirectUrl: `${APP_URL}/bibleapp/community/churches/${churchId}`,
        currency: "IDR",
        customer: {
          customerId: user.id,
          email:       profileRes.data?.email ?? user.email ?? undefined,
          givenNames:  profileRes.data?.display_name ?? profileRes.data?.full_name ?? undefined,
        },
        metadata: {
          church_id:        churchId,
          admin_user_id:    user.id,
          provider:         "xendit",
          type:             "church_plus",
        },
        paymentMethods: [
          "CREDIT_CARD", "BCA", "BNI", "BRI", "MANDIRI", "PERMATA",
          "OVO", "DANA", "LINKAJA", "SHOPEEPAY", "QRIS",
        ],
      },
    });

    return NextResponse.json({ url: invoice.invoiceUrl });
  } catch (e) {
    console.error("[/api/billing/xendit/church/checkout]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
