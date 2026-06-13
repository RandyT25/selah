"use client";

import { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { usePaymentProvider } from "@/hooks/usePaymentProvider";

const USD_AMOUNTS = [
  { value: 300,  label: "$3" },
  { value: 500,  label: "$5" },
  { value: 1000, label: "$10" },
  { value: 2500, label: "$25" },
  { value: 5000, label: "$50" },
];

const IDR_AMOUNTS = [
  { value: 30_000,  label: "Rp 30.000" },
  { value: 50_000,  label: "Rp 50.000" },
  { value: 100_000, label: "Rp 100.000" },
  { value: 250_000, label: "Rp 250.000" },
];

export default function DonatePage() {
  const { pricing, donate } = usePaymentProvider();
  const isIDR = pricing.provider === "xendit";

  const AMOUNTS = isIDR ? IDR_AMOUNTS : USD_AMOUNTS;
  const defaultAmount = isIDR ? 50_000 : 500;

  const [selected, setSelected]       = useState<number>(defaultAmount);
  const [custom, setCustom]           = useState("");
  const [message, setMessage]         = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading]         = useState(false);

  const resolvedAmount = custom
    ? (isIDR ? Math.round(parseFloat(custom)) : Math.round(parseFloat(custom) * 100))
    : selected;

  const minAmount = isIDR ? 10_000 : 100;

  const handleDonate = async () => {
    if (!resolvedAmount || resolvedAmount < minAmount) {
      toast.error(isIDR ? "Minimum donasi Rp 10.000" : "Minimum donation is $1");
      return;
    }
    setLoading(true);
    try {
      const url = await donate({
        amount:      resolvedAmount,
        message:     message.trim() || undefined,
        isAnonymous,
      });
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : (isIDR ? "Gagal memulai donasi" : "Failed to start donation"));
      setLoading(false);
    }
  };

  const displayAmount = () => {
    if (custom) {
      return isIDR ? `Rp ${parseFloat(custom).toLocaleString("id-ID")}` : `$${custom}`;
    }
    return AMOUNTS.find((a) => a.value === selected)?.label ?? "";
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto">
          <Heart className="h-6 w-6 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold">{isIDR ? "Dukung Selah" : "Support Selah"}</h1>
        <p className="text-muted-foreground text-sm">
          {isIDR
            ? "Dukunganmu menjaga Alkitab tetap gratis untuk semua orang. 100% digunakan untuk hosting, pengembangan, dan menjaga aplikasi bebas iklan."
            : "Your generosity keeps Bible reading free for everyone, everywhere. 100% goes toward hosting, development, and keeping the app ad-free."
          }
        </p>
      </div>

      {/* Amount presets */}
      <div>
        <p className="text-sm font-semibold mb-3">{isIDR ? "Pilih jumlah" : "Choose an amount"}</p>
        <div className={cn("grid gap-2", isIDR ? "grid-cols-2" : "grid-cols-5")}>
          {AMOUNTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setSelected(value); setCustom(""); }}
              className={cn(
                "py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                selected === value && !custom
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                  : "border-border hover:border-rose-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 relative">
          {!isIDR && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>}
          {isIDR && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>}
          <input
            type="number"
            min={isIDR ? "10000" : "1"}
            placeholder={isIDR ? "Jumlah lainnya" : "Custom amount"}
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setSelected(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{isIDR ? "Tinggalkan pesan (opsional)" : "Leave a message (optional)"}</Label>
        <Textarea
          placeholder={isIDR ? "Ceritakan apa arti Selah bagimu..." : "Share what Selah means to you..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={300}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/300</p>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
        <div>
          <p className="text-sm font-medium">{isIDR ? "Donasi anonim" : "Donate anonymously"}</p>
          <p className="text-xs text-muted-foreground">{isIDR ? "Namamu tidak akan muncul di catatan donatur" : "Your name won't appear in donor records"}</p>
        </div>
        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12 text-base font-semibold"
        onClick={handleDonate}
        disabled={loading || !resolvedAmount || resolvedAmount < minAmount}
      >
        {loading
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <>
              <Heart className="h-5 w-5 mr-2" />
              {isIDR ? "Berikan" : "Give"} {displayAmount()}
            </>
        }
      </Button>

      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {isIDR ? (
            <>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Aman via Xendit</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> GoPay · OVO · DANA · QRIS</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Secure checkout via Stripe</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> One-time gift</span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{isIDR ? "Tidak ada tagihan berulang. Terima kasih. 🙏" : "No recurring charge. Thank you. 🙏"}</p>
      </div>

    </div>
  );
}
