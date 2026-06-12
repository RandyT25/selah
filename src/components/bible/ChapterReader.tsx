"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BibleReader } from "./BibleReader";
import { toast } from "sonner";
import type { BibleVerse, VerseHighlight, VerseBookmark, UserPreferences } from "@/types/database";
import type { HighlightColor } from "@/types/app";
import type { BookInfo } from "@/lib/bible/books";

interface ChapterReaderProps {
  bookName: string;
  bookSlug: string;
  bookInfo: BookInfo;
  chapterNum: number;
  verses: BibleVerse[];
  highlights: VerseHighlight[];
  bookmarks: VerseBookmark[];
  preferences: UserPreferences | null;
  userId: string | undefined;
  navigation: {
    prevChapter: number | null;
    nextChapter: number | null;
    prevBook: { name: string; slug: string; lastChapter: number } | null;
    nextBook: { name: string; slug: string } | null;
  };
  basePath?: string;
  translation?: string;
}

export function ChapterReader({
  bookName,
  bookSlug,
  bookInfo,
  chapterNum,
  verses,
  highlights: initialHighlights,
  bookmarks: initialBookmarks,
  preferences,
  userId,
  navigation,
  basePath = "/bible",
  translation = "KJV",
}: ChapterReaderProps) {
  const [highlights, setHighlights] = useState(initialHighlights);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [fontSize, setFontSize] = useState(preferences?.font_size ?? 19);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">(preferences?.font_family ?? "serif");
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed" | "loose">(preferences?.line_spacing ?? "relaxed");
  const [showVerseNumbers, setShowVerseNumbers] = useState(preferences?.show_verse_numbers ?? true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [noteVerseId, setNoteVerseId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [, startTransition] = useTransition();

  // Helper: call server API routes (bypasses client-side RLS entirely)
  const api = async (path: string, method: string, body: object) => {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  };

  // ── Highlight ──────────────────────────────────────────────────────────────
  const handleHighlight = async (verseId: string, color: HighlightColor) => {
    if (!userId) { toast.error("Sign in to highlight verses"); return; }
    const prev = highlights;
    const optimistic: VerseHighlight = {
      id: crypto.randomUUID(),
      user_id: userId,
      verse_id: verseId,
      color,
      note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setHighlights([...prev.filter(h => h.verse_id !== verseId), optimistic]);
    try {
      await api("/api/verse/highlight", "POST", { verseId, color });
    } catch (err) {
      setHighlights(prev);
      throw err;
    }
  };

  const handleRemoveHighlight = async (verseId: string) => {
    if (!userId) return;
    const prev = highlights;
    setHighlights(prev.filter(h => h.verse_id !== verseId));
    try {
      await api("/api/verse/highlight", "DELETE", { verseId });
    } catch (err) {
      setHighlights(prev);
      throw err;
    }
  };

  // ── Bookmark ───────────────────────────────────────────────────────────────
  const handleBookmark = async (verseId: string) => {
    if (!userId) { toast.error("Sign in to bookmark verses"); return; }
    const prev = bookmarks;
    setBookmarks([...prev, {
      id: crypto.randomUUID(),
      user_id: userId,
      verse_id: verseId,
      collection_name: "Default",
      note: null,
      created_at: new Date().toISOString(),
    }]);
    try {
      await api("/api/verse/bookmark", "POST", { verseId });
    } catch (err) {
      setBookmarks(prev);
      throw err;
    }
  };

  const handleRemoveBookmark = async (verseId: string) => {
    if (!userId) return;
    const prev = bookmarks;
    setBookmarks(prev.filter(b => b.verse_id !== verseId));
    try {
      await api("/api/verse/bookmark", "DELETE", { verseId });
    } catch (err) {
      setBookmarks(prev);
      throw err;
    }
  };

  // ── Note ───────────────────────────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!userId || !noteVerseId || !noteContent.trim()) return;
    try {
      await api("/api/verse/note", "POST", { verseId: noteVerseId, content: noteContent.trim() });
      toast.success("Note saved");
      setNoteVerseId(null);
      setNoteContent("");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const savePreferences = () => {
    if (!userId) return;
    startTransition(async () => {
      await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font_size: fontSize, font_family: fontFamily, line_spacing: lineSpacing, show_verse_numbers: showVerseNumbers }),
      });
    });
  };

  const noteVerse = verses.find(v => v.id === noteVerseId);

  const prevHref = navigation.prevChapter
    ? `${basePath}/${bookSlug}/${navigation.prevChapter}`
    : navigation.prevBook
    ? `${basePath}/${navigation.prevBook.slug}/${navigation.prevBook.lastChapter}`
    : null;

  const nextHref = navigation.nextChapter
    ? `${basePath}/${bookSlug}/${navigation.nextChapter}`
    : navigation.nextBook
    ? `${basePath}/${navigation.nextBook.slug}/1`
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      {/* ── Minimal top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-black/95 backdrop-blur">
        <Link
          href={basePath}
          className="flex items-center justify-center h-9 w-9 rounded-full active:bg-black/8 dark:active:bg-white/8 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#888] border border-[#E0E0E0] dark:border-[#333] rounded-full px-2.5 py-1">
            {translation}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/8 dark:active:bg-white/8 transition-colors cursor-pointer"
            aria-label="Reader settings"
          >
            <Settings2 className="h-[18px] w-[18px] text-[#888]" strokeWidth={1.5} />
          </button>
          <button
            className="h-9 w-9 flex items-center justify-center rounded-full active:bg-black/8 dark:active:bg-white/8 transition-colors cursor-pointer"
            aria-label="More options"
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: `${bookName} ${chapterNum}`, url });
              } else {
                navigator.clipboard.writeText(url);
                toast.success("Link copied");
              }
            }}
          >
            <MoreHorizontal className="h-[18px] w-[18px] text-[#888]" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Chapter heading ── */}
      <div className="text-center pt-8 pb-6 px-5">
        <p className="text-[12px] font-semibold text-[#888] uppercase tracking-[0.15em] mb-1">{bookName}</p>
        <p className="text-[80px] font-bold leading-none tracking-tight text-[#111] dark:text-white">{chapterNum}</p>
      </div>

      {/* ── Verse content ── */}
      <div className="max-w-2xl mx-auto px-5 pb-[160px]">
        <BibleReader
          verses={verses}
          highlights={highlights}
          bookmarks={bookmarks}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          onBookmark={handleBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onNote={(verseId) => setNoteVerseId(verseId)}
          fontSize={fontSize}
          fontFamily={fontFamily}
          lineSpacing={lineSpacing}
          showVerseNumbers={showVerseNumbers}
        />
      </div>

      {/* ── Bottom pill navigation (fixed, above tab bar) ── */}
      <div
        className="fixed left-0 right-0 z-30 flex items-center justify-center gap-3 px-5 pb-3"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          className="h-11 w-11 flex items-center justify-center rounded-full bg-[#111] dark:bg-white active:opacity-70 transition-opacity cursor-pointer shadow-lg"
          aria-label="Audio"
          onClick={() => toast("Audio coming soon", { description: "Bible audio is on the way." })}
        >
          <Play className="h-4 w-4 text-white dark:text-black fill-current ml-0.5" />
        </button>

        <div className="flex items-center bg-[#111] dark:bg-white rounded-full shadow-lg overflow-hidden h-11">
          {prevHref ? (
            <Link
              href={prevHref}
              className="flex items-center justify-center h-11 w-12 active:opacity-70 transition-opacity cursor-pointer"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="h-5 w-5 text-white dark:text-black" strokeWidth={2} />
            </Link>
          ) : (
            <div className="h-11 w-12 flex items-center justify-center opacity-30">
              <ChevronLeft className="h-5 w-5 text-white dark:text-black" strokeWidth={2} />
            </div>
          )}

          <button
            onClick={() => setShowChapterNav(true)}
            className="px-3 flex items-center gap-1.5 h-full active:opacity-70 transition-opacity cursor-pointer"
          >
            <span className="text-[14px] font-semibold text-white dark:text-black whitespace-nowrap">
              {bookName} {chapterNum}
            </span>
          </button>

          {nextHref ? (
            <Link
              href={nextHref}
              className="flex items-center justify-center h-11 w-12 active:opacity-70 transition-opacity cursor-pointer"
              aria-label="Next chapter"
            >
              <ChevronRight className="h-5 w-5 text-white dark:text-black" strokeWidth={2} />
            </Link>
          ) : (
            <div className="h-11 w-12 flex items-center justify-center opacity-30">
              <ChevronRight className="h-5 w-5 text-white dark:text-black" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={(open) => { setShowSettings(open); if (!open) savePreferences(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reader Settings</DialogTitle></DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>Font Size: {fontSize}px</Label>
              <Slider min={14} max={30} step={1} value={[fontSize]} onValueChange={([v]) => setFontSize(v)} />
            </div>
            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as typeof fontFamily)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif (Classic)</SelectItem>
                  <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Line Spacing</Label>
              <Select value={lineSpacing} onValueChange={(v) => setLineSpacing(v as typeof lineSpacing)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="loose">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Verse Numbers</Label>
              <Switch checked={showVerseNumbers} onCheckedChange={setShowVerseNumbers} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chapter Nav Dialog */}
      <Dialog open={showChapterNav} onOpenChange={setShowChapterNav}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{bookName}</DialogTitle></DialogHeader>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-5 gap-2 pr-4">
              {Array.from({ length: bookInfo.chapters }, (_, i) => i + 1).map((ch) => (
                <Button key={ch} variant={ch === chapterNum ? "default" : "outline"} size="sm" className="h-10 text-sm" asChild>
                  <Link href={`${basePath}/${bookSlug}/${ch}`} onClick={() => setShowChapterNav(false)}>{ch}</Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={!!noteVerseId} onOpenChange={(open) => { if (!open) { setNoteVerseId(null); setNoteContent(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          {noteVerse && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{noteVerse.reference}</p>
              <p className="text-sm font-serif italic">{noteVerse.text}</p>
            </div>
          )}
          <Textarea
            placeholder="Write your reflection…"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setNoteVerseId(null); setNoteContent(""); }}>Cancel</Button>
            <Button onClick={handleSaveNote} disabled={!noteContent.trim()}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
