"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { PREMIUM_FEATURES } from "@/lib/billing/plans";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function UpgradeModal({ open, onOpenChange, featureName }: Props) {
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <DialogTitle>
              {featureName ? `Unlock ${featureName}` : "Upgrade to Premium"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ul className="space-y-1.5 mb-4">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f.key} className="flex items-center gap-2 text-sm">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {f.label}
            </li>
          ))}
        </ul>

        {/* Plan toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { key: "monthly" as const, label: "$3.99", sub: "per month" },
            { key: "annual"  as const, label: "$29.99", sub: "per year · save 37%" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelected(opt.key)}
              className={cn(
                "p-3 rounded-xl border-2 text-left transition-all",
                selected === opt.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              <p className="font-bold text-sm">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground">{opt.sub}</p>
            </button>
          ))}
        </div>

        <Button variant="gold" className="w-full" onClick={handleUpgrade} disabled={loading}>
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : `Start Premium — ${selected === "monthly" ? "$3.99/mo" : "$29.99/yr"}`
          }
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Cancel anytime. Bible reading is always free.
        </p>
      </DialogContent>
    </Dialog>
  );
}
