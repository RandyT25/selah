"use client";

import { useState } from "react";
import { Lock, Calendar, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import type { ReadingPlan } from "@/types/database";

export function PremiumPlanCard({ plan }: { plan: ReadingPlan }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <Card className="h-full flex flex-col opacity-90 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 pointer-events-none" />
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
            <Sparkles className="h-3.5 w-3.5 fill-amber-500" />
            <span className="text-xs font-semibold">Premium Plan</span>
          </div>
          <h3 className="font-semibold text-base mb-1 line-clamp-2">{plan.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{plan.description}</p>

          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{plan.duration_days} days</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{plan.subscriber_count.toLocaleString()}</span>
            </div>
          </div>

          <Button
            size="sm"
            variant="gold"
            className="w-full mt-auto gap-1.5"
            onClick={() => setShowUpgrade(true)}
          >
            <Lock className="h-3.5 w-3.5" />
            Unlock with Premium
          </Button>
        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={plan.title}
      />
    </>
  );
}
