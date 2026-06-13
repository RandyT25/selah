"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Globe, Church, Bell, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const DENOMINATIONS = [
  "Protestant",
  "Catholic",
  "Pentecostal",
  "Charismatic",
  "Baptist",
  "Reformed",
  "Non-denominational",
  "Other",
];

const READING_GOALS = [
  { value: 3,  label: "3 chapters",  sublabel: "Light — about 10 min/week" },
  { value: 7,  label: "7 chapters",  sublabel: "Steady — one a day" },
  { value: 14, label: "14 chapters", sublabel: "Committed — two a day" },
  { value: 28, label: "28 chapters", sublabel: "Deep dive — four a day" },
];

const STEPS = 4;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {[...Array(STEPS)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i < step ? "bg-primary w-6" : i === step ? "bg-primary w-6" : "bg-muted w-4"
          )}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [language, setLanguage] = useState<"en" | "id">("en");
  const [denomination, setDenomination] = useState<string | null>(null);
  const [readingGoal, setReadingGoal] = useState<number>(7);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const requestPushPermission = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") setNotificationsEnabled(true);
    } catch {
      // Permission denied or unavailable
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          denomination,
          reading_goal_chapters_per_week: readingGoal,
          language,
          completed: true,
        }),
      });

      // Save language cookie so the server picks it up immediately
      document.cookie = `selah_language=${language};path=/;max-age=31536000`;

      router.replace("/bibleapp/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark-transparent.png" alt="Selah" className="h-8 w-8" />
          <span className="font-bold text-lg">Selah</span>
        </div>
        <button
          onClick={finish}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 pb-6">
        <ProgressBar step={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 pb-6 max-w-md mx-auto w-full">

        {/* Step 0: Language */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Welcome to Selah</h1>
              <p className="text-muted-foreground">Choose your preferred language for reading the Bible.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "en" as const, label: "English", sub: "King James Version" },
                { value: "id" as const, label: "Bahasa Indonesia", sub: "Alkitab Yang Terbuka" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    language === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                  {language === opt.value && (
                    <div className="mt-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Denomination */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Church className="h-6 w-6 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold">Your Background</h1>
              <p className="text-muted-foreground">This helps us tailor content for you. You can skip this.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DENOMINATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDenomination(denomination === d ? null : d)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left text-sm transition-all",
                    denomination === d
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Reading Goal */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Reading Goal</h1>
              <p className="text-muted-foreground">How many chapters do you want to read per week?</p>
            </div>
            <div className="space-y-2">
              {READING_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setReadingGoal(g.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                    readingGoal === g.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div>
                    <p className="font-semibold text-sm">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.sublabel}</p>
                  </div>
                  {readingGoal === g.value && <Check className="h-5 w-5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-rose-600" />
              </div>
              <h1 className="text-2xl font-bold">Daily Verse</h1>
              <p className="text-muted-foreground">
                Get a verse of the day every morning at 8:00 AM — delivered straight to your device.
              </p>
            </div>

            {notificationsEnabled ? (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-400">Notifications enabled!</p>
                  <p className="text-xs text-green-700 dark:text-green-500">You'll receive your daily verse every morning.</p>
                </div>
              </div>
            ) : (
              <Button
                variant="gold"
                className="w-full"
                onClick={requestPushPermission}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Daily Notifications
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              You can change this anytime in Settings → Notifications.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10 max-w-md mx-auto w-full">
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={back} className="flex-none px-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {step < STEPS - 1 ? (
            <Button variant="gold" className="flex-1" onClick={next}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button variant="gold" className="flex-1" onClick={finish} disabled={saving}>
              {saving ? "Setting up…" : "Start Reading"}
              {!saving && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
