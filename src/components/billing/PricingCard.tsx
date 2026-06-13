"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { PREMIUM_FEATURES, FREE_FEATURES } from "@/lib/billing/plans";
import { usePaymentProvider } from "@/hooks/usePaymentProvider";
import { toast } from "sonner";

interface Props {
  variant: "free" | "monthly" | "annual";
  highlighted?: boolean;
}

export function PricingCard({ variant, highlighted = false }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { pricing, checkout } = usePaymentProvider();
  const isFree = variant === "free";

  const COPY = {
    free:    { label: "Free",    price: "$0",          period: "selamanya",   cta: "Paket saat ini" },
    monthly: { label: "Premium", price: pricing.monthly, period: "/ bulan",   cta: "Mulai Bulanan" },
    annual:  { label: "Premium", price: pricing.annual,  period: "/ tahun",   cta: `Mulai Tahunan — ${pricing.annualSub}` },
  };
  const copy = COPY[variant];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const url = await checkout(variant as "monthly" | "annual");
      router.push(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memulai pembayaran");
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "rounded-2xl border p-6 flex flex-col gap-5 relative",
      highlighted && "border-primary shadow-lg shadow-primary/10 bg-primary/5",
      !highlighted && "border-border bg-card"
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Terpopuler
          </span>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{copy.label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-4xl font-bold">{copy.price}</span>
          <span className="text-sm text-muted-foreground">{copy.period}</span>
        </div>
        {variant === "annual" && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
            {pricing.provider === "xendit" ? "Hanya Rp 37.417/bulan" : "Only $2.50/month — save $17.89/year"}
          </p>
        )}
        {pricing.provider === "xendit" && !isFree && (
          <p className="text-[10px] text-muted-foreground mt-0.5">GoPay · OVO · DANA · Transfer Bank · QRIS</p>
        )}
      </div>

      <ul className="space-y-2 flex-1">
        {isFree ? FREE_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        )) : (
          <>
            <li className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Semua fitur Gratis, plus:</li>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f.key} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{f.label}</span>
              </li>
            ))}
          </>
        )}
      </ul>

      {isFree ? (
        <Button variant="outline" disabled className="w-full">{copy.cta}</Button>
      ) : (
        <Button
          variant={highlighted ? "gold" : "outline"}
          className="w-full"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.cta}
        </Button>
      )}
    </div>
  );
}
