"use client";

import { Download, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineSave } from "@/hooks/useOfflineSave";
import { usePremium } from "@/hooks/usePremium";
import Link from "next/link";

interface Book {
  name: string;
  slug: string;
  chapters: number;
  testament: string;
}

const SUGGESTED_BOOKS: Book[] = [
  { name: "John",         slug: "john",         chapters: 21, testament: "NT" },
  { name: "Psalms",       slug: "psalms",       chapters: 150, testament: "OT" },
  { name: "Romans",       slug: "romans",       chapters: 16, testament: "NT" },
  { name: "Matthew",      slug: "matthew",      chapters: 28, testament: "NT" },
  { name: "Genesis",      slug: "genesis",      chapters: 50, testament: "OT" },
  { name: "Proverbs",     slug: "proverbs",     chapters: 31, testament: "OT" },
  { name: "Luke",         slug: "luke",         chapters: 24, testament: "NT" },
  { name: "Isaiah",       slug: "isaiah",       chapters: 66, testament: "OT" },
];

export function OfflineBookSection() {
  const { isPremium, upgrade } = usePremium();
  const { saveForOffline, isBookSaved, isBookSaving, supported } = useOfflineSave();

  if (!supported) return null;

  if (!isPremium) {
    return (
      <div className="rounded-xl border-2 border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <WifiOff className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Save books for offline reading</p>
            <p className="text-xs text-muted-foreground mt-1">
              Premium members can download entire books to read without an internet connection — great for travel, camps, and areas with poor signal.
            </p>
            <Button size="sm" variant="gold" className="mt-3" onClick={upgrade}>
              Unlock Offline Access
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Save for offline
        </h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Download books to read without internet. Tap once to cache all chapters.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SUGGESTED_BOOKS.map((book) => {
          const saved  = isBookSaved(book.slug);
          const saving = isBookSaving(book.slug);
          return (
            <div
              key={book.slug}
              className="flex items-center justify-between gap-2 p-3 rounded-xl border bg-card"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{book.name}</p>
                <p className="text-xs text-muted-foreground">{book.chapters} ch.</p>
              </div>
              {saved ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
              ) : (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => saveForOffline(book.slug, book.chapters)}
                  title={`Save ${book.name} offline`}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Downloaded books are stored in your browser.{" "}
        <Link href="/bibleapp/bible" className="underline underline-offset-2">Browse all books →</Link>
      </p>
    </div>
  );
}
