"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
  return arr.buffer;
}

export function PushPermission() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<"idle" | "prompt" | "loading" | "done">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const permission = Notification.permission;
    if (permission === "granted") {
      // Already granted — silently subscribe if not yet subscribed
      ensureSubscribed();
    } else if (permission === "default") {
      // Show banner after 3s
      const t = setTimeout(() => setStatus("prompt"), 3000);
      return () => clearTimeout(t);
    }
    // "denied" — do nothing
  }, []);

  const ensureSubscribed = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) return; // already subscribed

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      // Silently ignore — user can retry from settings
    }
  };

  const requestPermission = async () => {
    setStatus("loading");
    const result = await Notification.requestPermission();
    if (result === "granted") {
      await ensureSubscribed();
      setStatus("done");
    } else {
      setStatus("done");
    }
  };

  if (status !== "prompt") return null;

  return (
    <div className="fixed bottom-[76px] left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white rounded-2xl shadow-2xl p-4 flex gap-3 items-start">
        <div className="mt-0.5 h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <Bell className="h-4.5 w-4.5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug">
            {language === "id" ? "Ayat & Renungan Harian" : "Daily Verse & Devotional"}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-snug">
            {language === "id"
              ? "Aktifkan notifikasi untuk menerima ayat dan renungan setiap pagi."
              : "Get your daily verse and devotional every morning."}
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-8 text-xs px-3"
              onClick={requestPermission}
            >
              {language === "id" ? "Aktifkan" : "Enable"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 h-8 text-xs px-3"
              onClick={() => setStatus("done")}
            >
              {language === "id" ? "Nanti saja" : "Not now"}
            </Button>
          </div>
        </div>
        <button
          onClick={() => setStatus("done")}
          className="text-white/30 hover:text-white/70 mt-0.5 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
