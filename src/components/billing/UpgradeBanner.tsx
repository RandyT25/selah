"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { usePremium } from "@/hooks/usePremium";
import { useAnalytics } from "@/hooks/useAnalytics";

const DISMISSED_KEY = "selah_upgrade_banner_dismissed";

export function UpgradeBanner() {
  const { isPremium } = usePremium();
  const { capture } = useAnalytics();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isPremium) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, [isPremium]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    capture("upgrade_banner_dismissed");
    setVisible(false);
  };

  if (!visible || isPremium) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl mb-4",
      "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
      "border border-amber-200 dark:border-amber-800"
    )}>
      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
        <Sparkles className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
          Unlock Premium features
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-500 truncate">
          Unlimited AI, PDF export, growth dashboard &amp; more
        </p>
      </div>
      <Link
        href="/bibleapp/upgrade"
        className="shrink-0 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
      >
        See plans
      </Link>
      <button onClick={dismiss} className="shrink-0 text-amber-600 hover:text-amber-800 transition-colors ml-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
