"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Highlighter,
  MessageSquare,
  Share2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface PopupState {
  verseId: string | null;
  position: { x: number; y: number };
  mode: "main" | "highlight";
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
  const [popup, setPopup] = useState<PopupState>({ verseId: null, position: { x: 0, y: 0 }, mode: "main" });
  const [loading, setLoading] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const highlightMap = Object.fromEntries(highlights.map((h) => [h.verse_id, h]));
  const bookmarkSet = new Set(bookmarks.map((b) => b.verse_id));

  const closePopup = useCallback(() => {
    setPopup({ verseId: null, position: { x: 0, y: 0 }, mode: "main" });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".verse-action-popup")) {
        closePopup();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closePopup]);

  const handleVerseClick = (verse: BibleVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };

    setPopup({
      verseId: verse.id,
      position: {
        x: rect.left - containerRect.left,
        y: rect.bottom - containerRect.top + 8,
      },
      mode: "main",
    });
  };

  const handleCopy = async (verse: BibleVerse) => {
    await navigator.clipboard.writeText(`${verse.text} — ${verse.reference}`);
    toast.success("Verse copied to clipboard");
    closePopup();
  };

  const handleShare = async (verse: BibleVerse) => {
    if (navigator.share) {
      await navigator.share({
        title: verse.reference,
        text: `${verse.text} — ${verse.reference}`,
      });
    } else {
      await navigator.clipboard.writeText(`${verse.text} — ${verse.reference}`);
      toast.success("Verse copied for sharing");
    }
    closePopup();
  };

  const handleHighlightSelect = async (color: HighlightColor) => {
    if (!popup.verseId) return;
    setLoading(popup.verseId);
    try {
      await onHighlight(popup.verseId, color);
      toast.success("Verse highlighted");
    } finally {
      setLoading(null);
      closePopup();
    }
  };

  const handleRemoveHighlight = async (verseId: string) => {
    setLoading(verseId);
    try {
      await onRemoveHighlight(verseId);
      toast.success("Highlight removed");
    } finally {
      setLoading(null);
      closePopup();
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
        toast.success("Verse bookmarked");
      }
    } finally {
      setLoading(null);
      closePopup();
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

  const selectedVerse = verses.find((v) => v.id === popup.verseId);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn("space-y-1", fontClass, spacingClass)}
        style={{ fontSize: `${fontSize}px` }}
      >
        {verses.map((verse) => {
          const highlight = highlightMap[verse.id];
          const isBookmarked = bookmarkSet.has(verse.id);

          return (
            <span
              key={verse.id}
              className={cn(
                "cursor-pointer hover:bg-muted/50 rounded px-0.5 py-0.5 transition-colors inline",
                highlight && `highlight-${highlight.color}`,
                popup.verseId === verse.id && "ring-1 ring-primary/30 rounded"
              )}
              onClick={(e) => handleVerseClick(verse, e)}
            >
              {showVerseNumbers && (
                <span className="verse-number">{verse.verse_number}</span>
              )}
              {verse.text}{" "}
            </span>
          );
        })}
      </div>

      {/* Action Popup */}
      {popup.verseId && selectedVerse && (
        <div
          className="verse-action-popup absolute z-30"
          style={{
            left: Math.max(0, popup.position.x),
            top: popup.position.y,
          }}
        >
          {popup.mode === "main" ? (
            <div className="flex items-center gap-1 p-1.5 rounded-xl border bg-popover shadow-xl">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setPopup((p) => ({ ...p, mode: "highlight" }))}
                    >
                      <Highlighter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Highlight</TooltipContent>
                </Tooltip>

                {highlightMap[popup.verseId] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleRemoveHighlight(popup.verseId!)}
                        disabled={loading === popup.verseId}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove Highlight</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleBookmarkToggle(popup.verseId!)}
                      disabled={loading === popup.verseId}
                    >
                      {bookmarkSet.has(popup.verseId) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {bookmarkSet.has(popup.verseId) ? "Remove Bookmark" : "Bookmark"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => { onNote(popup.verseId!); closePopup(); }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Note</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleCopy(selectedVerse)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleShare(selectedVerse)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-2 rounded-xl border bg-popover shadow-xl">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setPopup((p) => ({ ...p, mode: "main" }))}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="w-px h-4 bg-border" />
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.id}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleHighlightSelect(color.id as HighlightColor)}
                  title={color.label}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
