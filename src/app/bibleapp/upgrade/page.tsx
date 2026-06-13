"use client";

import { useState, useEffect } from "react";
import { Sparkles, Shield, Zap, BookOpen, FileText, Headphones, BarChart3, Loader2 } from "lucide-react";
import { PricingCard } from "@/components/billing/PricingCard";
import { usePremium } from "@/hooks/usePremium";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UpgradePage() {
  const { isPremium, plan } = usePremium();
  const { capture } = useAnalytics();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    capture("upgrade_page_viewed", { source: "direct" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Selah Premium
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Go deeper in your faith.
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Premium unlocks tools that help you study, reflect, and grow — powered by AI, beautifully designed.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap,       label: "Unlimited AI",         sub: "Study Scripture without limits"  },
          { icon: BookOpen,  label: "Exclusive Plans",      sub: "Curated premium reading plans"   },
          { icon: FileText,  label: "PDF Journal Export",   sub: "Take your reflections anywhere"  },
          { icon: Headphones,label: "Offline Audio",        sub: "Listen without internet"         },
          { icon: BarChart3, label: "Growth Dashboard",     sub: "See your spiritual progress"     },
          { icon: Shield,    label: "Support the Mission",  sub: "Keep Selah free for everyone"    },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex gap-3 p-4 rounded-xl border bg-card">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing cards */}
      {isPremium ? (
        <div className="text-center space-y-4 py-4">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
            <Sparkles className="h-4 w-4" />
            You are on {plan === "annual" ? "Annual" : "Monthly"} Premium — thank you! 🙏
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your subscription, update payment, or cancel anytime.
          </p>
          <Button variant="outline" onClick={openPortal} disabled={portalLoading}>
            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage Subscription"}
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-center text-xl font-bold mb-6">Choose your plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PricingCard variant="free" />
            <PricingCard variant="annual" highlighted />
            <PricingCard variant="monthly" />
          </div>
        </div>
      )}

      {/* Guarantee */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-sm font-semibold">📖 Bible reading is always free. Always.</p>
        <p className="text-xs text-muted-foreground">
          Cancel anytime. No questions asked. Premium features are extras, not gates to the Gospel.
        </p>
      </div>

    </div>
  );
}
