"use client";

import { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const AMOUNTS = [
  { cents: 300,  label: "$3" },
  { cents: 500,  label: "$5" },
  { cents: 1000, label: "$10" },
  { cents: 2500, label: "$25" },
  { cents: 5000, label: "$50" },
];

export default function DonatePage() {
  const [selected, setSelected]         = useState<number>(500);
  const [custom, setCustom]             = useState("");
  const [message, setMessage]           = useState("");
  const [isAnonymous, setIsAnonymous]   = useState(false);
  const [loading, setLoading]           = useState(false);

  const resolvedCents = custom
    ? Math.round(parseFloat(custom) * 100)
    : selected;

  const handleDonate = async () => {
    if (!resolvedCents || resolvedCents < 100) {
      toast.error("Minimum donation is $1");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: resolvedCents,
          currency: "usd",
          message: message.trim() || undefined,
          isAnonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start donation");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto">
          <Heart className="h-6 w-6 text-rose-600" />
        </div>
        <h1 className="text-2xl font-bold">Support Selah</h1>
        <p className="text-muted-foreground text-sm">
          Your generosity keeps Bible reading free for everyone, everywhere. 100% goes toward hosting, development, and keeping the app ad-free.
        </p>
      </div>

      {/* Amount presets */}
      <div>
        <p className="text-sm font-semibold mb-3">Choose an amount</p>
        <div className="grid grid-cols-5 gap-2">
          {AMOUNTS.map(({ cents, label }) => (
            <button
              key={cents}
              onClick={() => { setSelected(cents); setCustom(""); }}
              className={cn(
                "py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                selected === cents && !custom
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                  : "border-border hover:border-rose-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <input
            type="number"
            min="1"
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setSelected(0); }}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Leave a message (optional)</Label>
        <Textarea
          placeholder="Share what Selah means to you..."
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
          <p className="text-sm font-medium">Donate anonymously</p>
          <p className="text-xs text-muted-foreground">Your name won't appear in donor records</p>
        </div>
        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12 text-base font-semibold"
        onClick={handleDonate}
        disabled={loading || (!resolvedCents || resolvedCents < 100)}
      >
        {loading
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <>
              <Heart className="h-5 w-5 mr-2" />
              Give {custom ? `$${custom}` : AMOUNTS.find((a) => a.cents === selected)?.label ?? ""}
            </>
        }
      </Button>

      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Secure checkout via Stripe</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> One-time gift</span>
        </div>
        <p className="text-xs text-muted-foreground">No recurring charge. Thank you. 🙏</p>
      </div>

    </div>
  );
}
