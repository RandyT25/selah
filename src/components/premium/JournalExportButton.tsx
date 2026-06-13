"use client";

import { useState } from "react";
import { FileText, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils/cn";

interface Props {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function JournalExportButton({ className, variant = "outline" }: Props) {
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleExport = () => {
    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }
    // Open print-optimized export page in a new tab
    const win = window.open("/bibleapp/journal/export?print=1", "_blank");
    if (win) {
      win.addEventListener("load", () => {
        setTimeout(() => win.print(), 500);
      });
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={handleExport}
        className={cn("gap-1.5", className)}
      >
        {isPremium ? (
          <FileText className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        Export PDF
      </Button>

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName="Journal PDF Export"
      />
    </>
  );
}
