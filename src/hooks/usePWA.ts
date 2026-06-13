"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "selah_pwa_dismissed_at";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Respect 7-day dismiss cooldown
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    const cooledDown = !dismissedAt || Date.now() - parseInt(dismissedAt) > COOLDOWN_MS;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (cooledDown) setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed"> => {
    if (!installPrompt) return "dismissed";
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
    return outcome;
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setInstallPrompt(null);
  }, []);

  return { installPrompt, isInstalled, isOnline, install, dismissInstall };
}
