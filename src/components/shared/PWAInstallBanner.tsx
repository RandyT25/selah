"use client";

import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";
import { useAnalytics } from "@/hooks/useAnalytics";

export function PWAInstallBanner() {
  const { installPrompt, isInstalled, install, dismissInstall } = usePWA();
  const { capture } = useAnalytics();

  if (!installPrompt || isInstalled) return null;

  const handleInstall = async () => {
    capture("pwa_install_prompted");
    const outcome = await install();
    capture(outcome === "accepted" ? "pwa_install_accepted" : "pwa_install_dismissed");
  };

  const handleDismiss = () => {
    capture("pwa_install_dismissed");
    dismissInstall();
  };

  return (
    <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border bg-primary/5 border-primary/20 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Download className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">Install Selah</p>
        <p className="text-xs text-muted-foreground">Read offline, anytime — add to home screen</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="gold" onClick={handleInstall} className="h-8 text-xs px-3">
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
