"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  MessageSquare,
  Share2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { HIGHLIGHT_COLORS, type HighlightColor } from "@/types/app";
import type { BibleVerse, VerseHighlight, VerseBookmark } from "@/types/database";

interface BibleReaderProps {
  verses: BibleVerse[];
  highlights: VerseHighlight[];
  bookmarks: VerseBookmark[];
  onHighlight: (verseId: string, color: HighlightColor) => Promise<void>;
  onRemoveHighlight: (verseId: string) => Promise<void>;
  onBookmark: (verseId: string) => Promise<void>;
  onRemoveBookmark: (verseId: string) => Promise<void>;
  onNote: (verseId: string) => void;
  fontSize: number;
  fontFamily: "serif" | "sans" | "mono";
  lineSpacing: "compact" | "normal" | "relaxed" | "loose";
  showVerseNumbers: boolean;
}

export function BibleReader({
  verses,
  highlights,
  bookmarks,
  onHighlight,
  onRemoveHighlight,
  onBookmark,
  onRemoveBookmark,
  onNote,
  fontSize,
  fontFamily,
  lineSpacing,
  showVerseNumbers,
}: BibleReaderProps) {
  const [selectedVerseId, setSelectedVerseId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const highlightMap = Object.fromEntries(highlights.map((h) => [h.verse_id, h]));
  const bookmarkSet = new Set(bookmarks.map((b) => b.verse_id));

  const closeSheet = useCallback(() => setSelectedVerseId(null), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeSheet]);

  const handleCopy = async (verse: BibleVerse) => {
    await navigator.clipboard.writeText(`"${verse.text.trim()}" — ${verse.reference}`);
    toast.success("Verse copied");
    closeSheet();
  };

  const handleShare = async (verse: BibleVerse) => {
    if (navigator.share) {
      await navigator.share({ title: verse.reference, text: `"${verse.text.trim()}" — ${verse.reference}` });
    } else {
      await navigator.clipboard.writeText(`"${verse.text.trim()}" — ${verse.reference}`);
      toast.success("Verse copied for sharing");
    }
    closeSheet();
  };

  const handleHighlightSelect = async (color: HighlightColor) => {
    if (!selectedVerseId) return;
    setLoading(selectedVerseId);
    try {
      await onHighlight(selectedVerseId, color);
      toast.success("Highlighted");
    } finally {
      setLoading(null);
      closeSheet();
    }
  };

  const handleRemoveHighlight = async (verseId: string) => {
    setLoading(verseId);
    try {
      await onRemoveHighlight(verseId);
      toast.success("Highlight removed");
    } finally {
      setLoading(null);
      closeSheet();
    }
  };

  const handleBookmarkToggle = async (verseId: string) => {
    setLoading(verseId);
    try {
      if (bookmarkSet.has(verseId)) {
        await onRemoveBookmark(verseId);
        toast.success("Bookmark removed");
      } else {
        await onBookmark(verseId);
        toast.success("Bookmarked");
      }
    } finally {
      setLoading(null);
      closeSheet();
    }
  };

  const spacingClass = {
    compact: "leading-snug",
    normal: "leading-relaxed",
    relaxed: "leading-loose",
    loose: "leading-[2.4]",
  }[lineSpacing];

  const fontClass = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
  }[fontFamily];

  const selectedVerse = verses.find((v) => v.id === selectedVerseId);

  return (
    <>
      {/* Verse text */}
      <div className={cn("space-y-0.5", fontClass, spacingClass)} style={{ fontSize: `${fontSize}px` }}>
        {verses.map((verse) => {
          const highlight = highlightMap[verse.id];
          const isSelected = selectedVerseId === verse.id;

          return (
            <span
              key={verse.id}
              className={cn(
                "cursor-pointer transition-colors inline rounded-sm px-0.5",
                highlight ? `highlight-${highlight.color}` : "",
                isSelected && !highlight ? "bg-[#F5F5F5] dark:bg-[#2A2A2A]" : "",
                isSelected && highlight ? "ring-1 ring-offset-0 ring-[#999]/50 dark:ring-white/20 rounded" : "",
                !isSelected && !highlight ? "hover:bg-black/5 dark:hover:bg-white/5" : "",
              )}
              onClick={() => setSelectedVerseId(isSelected ? null : verse.id)}
            >
              {showVerseNumbers && (
                <sup className="verse-number text-[0.65em] font-semibold text-[#888] mr-[2px] align-super">
                  {verse.verse_number}
                </sup>
              )}
              {verse.text}{" "}
            </span>
          );
        })}
      </div>

      {/* Bottom sheet backdrop */}
      {selectedVerseId && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
          onClick={closeSheet}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={cn(
          "fixed left-0 right-0 z-50 bg-white dark:bg-[#1C1C1C] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out",
          selectedVerseId ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          bottom: 0,
          paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[3px] bg-[#E0E0E0] dark:bg-[#444] rounded-full" />
        </div>

        {selectedVerse && (
          <>
            {/* Reference + close */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <p className="text-[13px] font-semibold text-[#888]">{selectedVerse.reference}</p>
              <button
                onClick={closeSheet}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-[#F0F0F0] dark:bg-[#333] cursor-pointer"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5 text-[#666] dark:text-[#CCC]" />
              </button>
            </div>

            {/* Verse preview */}
            <p className="px-5 pb-3 text-[14px] font-serif leading-relaxed line-clamp-2 text-[#444] dark:text-[#BBB]">
              {selectedVerse.text.trim()}
            </p>

            {/* Divider */}
            <div className="h-px bg-[#F0F0F0] dark:bg-[#2A2A2A] mx-5" />

            {/* Color picker */}
            <div className="flex items-center gap-3 px-5 py-4">
              {highlightMap[selectedVerse.id] && (
                <button
                  onClick={() => handleRemoveHighlight(selectedVerse.id)}
                  disabled={loading === selectedVerse.id}
                  className="h-8 w-8 rounded-full border-2 border-[#DDD] dark:border-[#555] flex items-center justify-center cursor-pointer"
                  title="Remove highlight"
                >
                  <X className="h-3.5 w-3.5 text-[#888]" />
                </button>
              )}
              {HIGHLIGHT_COLORS.map((color) => {
                const isActive = highlightMap[selectedVerse.id]?.color === color.id;
                return (
                  <button
                    key={color.id}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform active:scale-90 cursor-pointer",
                      isActive ? "border-[#333] dark:border-white scale-110" : "border-white dark:border-[#1C1C1C]",
                    )}
                    style={{ backgroundColor: color.hex, boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }}
                    onClick={() => handleHighlightSelect(color.id as HighlightColor)}
                    title={color.label}
                  />
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F0F0F0] dark:bg-[#2A2A2A]" />

            {/* Action row */}
            <div className="grid grid-cols-4 divide-x divide-[#F0F0F0] dark:divide-[#2A2A2A]">
              {[
                {
                  icon: bookmarkSet.has(selectedVerse.id) ? BookmarkCheck : Bookmark,
                  label: bookmarkSet.has(selectedVerse.id) ? "Saved" : "Save",
                  action: () => handleBookmarkToggle(selectedVerse.id),
                  active: bookmarkSet.has(selectedVerse.id),
                },
                {
                  icon: MessageSquare,
                  label: "Note",
                  action: () => { onNote(selectedVerse.id); closeSheet(); },
                  active: false,
                },
                {
                  icon: Copy,
                  label: "Copy",
                  action: () => handleCopy(selectedVerse),
                  active: false,
                },
                {
                  icon: Share2,
                  label: "Share",
                  action: () => handleShare(selectedVerse),
                  active: false,
                },
              ].map(({ icon: Icon, label, action, active }) => (
                <button
                  key={label}
                  onClick={action}
                  disabled={loading === selectedVerse.id}
                  className="flex flex-col items-center gap-1.5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#252525] transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-[#111] dark:text-white" : "text-[#666] dark:text-[#AAA]"
                    )}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  <span className={cn(
                    "text-[11px] font-medium",
                    active ? "text-[#111] dark:text-white" : "text-[#666] dark:text-[#AAA]"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
