"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export type PaymentProvider = "stripe" | "xendit";

interface PremiumPricing {
  provider:  PaymentProvider;
  monthly:   string;
  annual:    string;
  annualSub: string;
  currency:  string;
}

export function usePaymentProvider(): {
  provider:    PaymentProvider;
  pricing:     PremiumPricing;
  checkout:    (plan: "monthly" | "annual") => Promise<string>;
  donate:      (params: { amount: number; message?: string; isAnonymous: boolean }) => Promise<string>;
  churchPlus:  (churchId: string) => Promise<string>;
} {
  const { language } = useLanguage();
  const isID = language === "id";
  const provider: PaymentProvider = isID ? "xendit" : "stripe";

  const pricing: PremiumPricing = isID
    ? { provider: "xendit", monthly: "Rp 59.000", annual: "Rp 449.000", annualSub: "hemat 37%", currency: "IDR" }
    : { provider: "stripe", monthly: "$3.99",     annual: "$29.99",     annualSub: "save 37%",  currency: "USD" };

  const checkout = async (plan: "monthly" | "annual"): Promise<string> => {
    const endpoint = isID
      ? "/api/billing/xendit/checkout"
      : "/api/billing/checkout";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Checkout failed");
    return data.url as string;
  };

  const donate = async (params: { amount: number; message?: string; isAnonymous: boolean }): Promise<string> => {
    const endpoint = isID ? "/api/billing/xendit/donate" : "/api/billing/donate";

    const body = isID
      ? { amountIDR: params.amount, message: params.message, isAnonymous: params.isAnonymous }
      : { amountCents: params.amount, currency: "usd", message: params.message, isAnonymous: params.isAnonymous };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Donation failed");
    return data.url as string;
  };

  const churchPlus = async (churchId: string): Promise<string> => {
    const endpoint = isID
      ? "/api/billing/xendit/church/checkout"
      : "/api/billing/church/checkout";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ churchId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Checkout failed");
    return data.url as string;
  };

  return { provider, pricing, checkout, donate, churchPlus };
}
