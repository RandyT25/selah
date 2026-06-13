"use client";

import { useEffect, useState } from "react";
import { Zap, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface UsageData {
  queryCount: number;
  limit: number;
  remaining: number;
  isAtLimit: boolean;
  isUnlimited: boolean;
}

export function AIUsageMeter({ className }: { className?: string }) {
  const { isPremium } = usePremium();
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (isPremium) return;
    fetch("/api/ai/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, [isPremium]);

  if (isPremium) return null;
  if (!usage) return null;

  const pct = Math.round((usage.queryCount / usage.limit) * 100);
  const isNearLimit = usage.remaining <= 2;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm",
      usage.isAtLimit
        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        : isNearLimit
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
        : "bg-muted/50 border-border",
      className
    )}>
      <Zap className={cn(
        "h-4 w-4 shrink-0",
        usage.isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">
            {usage.isAtLimit ? "Daily limit reached" : `${usage.queryCount} / ${usage.limit} queries today`}
          </span>
          {!usage.isAtLimit && (
            <span className="text-[10px] text-muted-foreground">{usage.remaining} left</span>
          )}
        </div>
        <Progress
          value={pct}
          className={cn(
            "h-1.5",
            usage.isAtLimit && "[&>div]:bg-red-500",
            isNearLimit && !usage.isAtLimit && "[&>div]:bg-amber-500"
          )}
        />
      </div>
      {usage.isAtLimit && (
        <Button size="sm" variant="gold" className="shrink-0 h-7 text-xs gap-1" asChild>
          <Link href="/bibleapp/upgrade">
            <Sparkles className="h-3 w-3" /> Upgrade
          </Link>
        </Button>
      )}
    </div>
  );
}
