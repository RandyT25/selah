"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallBanner() {
  const { installPrompt, install, isInstalled } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!installPrompt || isInstalled || dismissed) return null;

  return (
    <div className="install-banner">
      <div className="w-10 h-10 selah-gradient rounded-xl flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-sm">S</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">Add Selah to Home Screen</p>
        <p className="text-xs text-muted-foreground">Read offline, anytime</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="gold" onClick={install}>
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
