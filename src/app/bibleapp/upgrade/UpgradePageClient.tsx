"use client";

import { useState, useEffect } from "react";
import { Sparkles, Shield, Zap, BookOpen, FileText, Headphones, BarChart3, Loader2, Bell, Check, X } from "lucide-react";
import { PricingCard } from "@/components/billing/PricingCard";
import { WaitlistForm } from "@/components/billing/WaitlistForm";
import { usePremium } from "@/hooks/usePremium";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FEATURE_HIGHLIGHTS = [
  { icon: Zap,        label: "Unlimited AI",        sub: "Study Scripture without limits"  },
  { icon: BookOpen,   label: "Exclusive Plans",     sub: "Curated premium reading plans"   },
  { icon: FileText,   label: "PDF Journal Export",  sub: "Take your reflections anywhere"  },
  { icon: Headphones, label: "Offline Audio",       sub: "Listen without internet"         },
  { icon: BarChart3,  label: "Growth Dashboard",    sub: "See your spiritual progress"     },
  { icon: Shield,     label: "Support the Mission", sub: "Keep Selah free for everyone"    },
];

const COMPARISON_ROWS: { label: string; free: string | boolean; premium: string | boolean }[] = [
  { label: "Bible reading (KJV + AYT)",    free: true,        premium: true        },
  { label: "Daily devotionals",            free: true,        premium: true        },
  { label: "Prayer community",             free: true,        premium: true        },
  { label: "Journal (unlimited entries)",  free: true,        premium: true        },
  { label: "Church community",             free: true,        premium: true        },
  { label: "Growth dashboard & streaks",   free: true,        premium: true        },
  { label: "AI Bible assistant",           free: "10 / day",  premium: "Unlimited" },
  { label: "Reading plans",               free: "3 plans",   premium: "Unlimited" },
  { label: "PDF journal export",          free: false,       premium: true        },
  { label: "Audio Bible (OT + NT)",       free: false,       premium: true        },
];

interface Props {
  paymentsEnabled: boolean;
}

export function UpgradePageClient({ paymentsEnabled }: Props) {
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
        {FEATURE_HIGHLIGHTS.map(({ icon: Icon, label, sub }) => (
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

      {/* Comparison table */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-1/2">Feature</th>
              <th className="text-center px-4 py-3 font-semibold w-1/4">Free</th>
              <th className="text-center px-4 py-3 font-semibold w-1/4 text-amber-600 dark:text-amber-400">Premium</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                <td className="px-4 py-2.5 text-center">
                  {typeof row.free === "boolean" ? (
                    row.free
                      ? <Check className="h-4 w-4 text-green-500 mx-auto" />
                      : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{row.free}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {typeof row.premium === "boolean" ? (
                    row.premium
                      ? <Check className="h-4 w-4 text-amber-500 mx-auto" />
                      : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{row.premium}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing / waitlist section */}
      {paymentsEnabled ? (
        isPremium ? (
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
        )
      ) : (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Premium is coming soon</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We&apos;re putting the finishing touches on premium. Join the waitlist and be first to know when it launches.
            </p>
          </div>
          <WaitlistForm />
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
