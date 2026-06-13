"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { PREMIUM_FEATURES } from "@/lib/billing/plans";

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const { refresh } = usePremium();

  // Refresh subscription state now that Stripe has confirmed payment
  useEffect(() => {
    // Give the webhook a moment to process, then refresh context
    const t = setTimeout(() => { refresh(); }, 2000);
    return () => clearTimeout(t);
  }, [refresh]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome to Premium! 🎉</h1>
        <p className="text-muted-foreground">
          Your subscription is active. Thank you for supporting Selah's mission to make Scripture accessible to everyone.
        </p>
      </div>

      <div className="text-left space-y-2 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> You now have access to:
        </p>
        <ul className="space-y-1">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f.key} className="text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {f.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="gold" className="flex-1" onClick={() => router.push("/bibleapp/dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push("/bibleapp/ai")}>
          Try Unlimited AI
        </Button>
      </div>
    </div>
  );
}
