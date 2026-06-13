"use client";

import { Lock } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface Props {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Show a soft overlay instead of replacing children */
  overlay?: boolean;
}

export function PremiumFeatureGate({ featureKey, children, fallback, overlay = false }: Props) {
  const { canAccess, upgrade } = usePremium();

  if (canAccess(featureKey)) return <>{children}</>;

  if (overlay) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 backdrop-blur-[1px] rounded-xl">
          <Lock className="h-5 w-5 text-amber-500" />
          <Button size="sm" variant="gold" onClick={upgrade} className="text-xs px-3 py-1.5 h-auto">
            Unlock with Premium
          </Button>
        </div>
      </div>
    );
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-xl",
      "border-2 border-dashed border-amber-200 dark:border-amber-800",
      "bg-amber-50/50 dark:bg-amber-950/20 text-center gap-3"
    )}>
      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
        <Lock className="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <p className="font-semibold text-sm">Premium Feature</p>
        <p className="text-xs text-muted-foreground mt-0.5">Upgrade to unlock this feature.</p>
      </div>
      <Button size="sm" variant="gold" onClick={upgrade}>Upgrade to Premium</Button>
    </div>
  );
}
