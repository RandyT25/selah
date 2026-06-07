"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export function InstallAppButton() {
  const { installPrompt, install, isInstalled } = usePWA();

  if (isInstalled) {
    return (
      <Button size="sm" variant="gold" disabled>
        ✓ Already Installed
      </Button>
    );
  }

  if (!installPrompt) {
    return (
      <Button size="sm" variant="gold" asChild>
        <a href="/dashboard">Open App</a>
      </Button>
    );
  }

  return (
    <Button size="sm" variant="gold" onClick={install}>
      <Download className="h-4 w-4 mr-1" />
      Install Now
    </Button>
  );
}
