"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  {
    code: "en" as const,
    label: "English",
    sub: "Continue in English",
    flag: "🇺🇸",
  },
  {
    code: "id" as const,
    label: "Bahasa Indonesia",
    sub: "Lanjutkan dalam Bahasa Indonesia",
    flag: "🇮🇩",
  },
];

export function LanguagePickerModal() {
  const { setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("selah_language");
    if (!stored) setOpen(true);
  }, []);

  const pick = (code: "en" | "id") => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm text-center"
        // Prevent closing by clicking outside or pressing Escape
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="py-2">
          <div className="text-4xl mb-3">✝️</div>
          <h2 className="text-xl font-bold mb-1">Welcome to Selah</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose your language / Pilih bahasa Anda
          </p>

          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="w-full h-auto py-4 flex flex-col gap-1"
                onClick={() => pick(lang.code)}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-semibold">{lang.label}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {lang.sub}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
