"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  BookOpen,
  List,
  MessageSquare,
  X,
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
import { createClient } from "@/lib/supabase/client";
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
}: ChapterReaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [highlights, setHighlights] = useState(initialHighlights);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [fontSize, setFontSize] = useState(preferences?.font_size ?? 18);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">(preferences?.font_family ?? "serif");
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed" | "loose">(preferences?.line_spacing ?? "normal");
  const [showVerseNumbers, setShowVerseNumbers] = useState(preferences?.show_verse_numbers ?? true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [noteVerseId, setNoteVerseId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [, startTransition] = useTransition();

  const handleHighlight = async (verseId: string, color: HighlightColor) => {
    if (!userId) { toast.error("Sign in to highlight verses"); return; }
    // Optimistic update first — visual applies immediately regardless of DB
    const optimistic = { id: crypto.randomUUID(), user_id: userId, verse_id: verseId, color, note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setHighlights(prev => [...prev.filter(h => h.verse_id !== verseId), optimistic]);
    // Persist to DB (delete+insert avoids upsert conflict)
    await supabase.from("verse_highlights").delete().eq("user_id", userId).eq("verse_id", verseId);
    const { error } = await supabase.from("verse_highlights").insert({ user_id: userId, verse_id: verseId, color });
    if (error) { console.error("highlight save error:", error); }
  };

  const handleRemoveHighlight = async (verseId: string) => {
    if (!userId) return;
    setHighlights(prev => prev.filter(h => h.verse_id !== verseId));
    await supabase.from("verse_highlights").delete().eq("user_id", userId).eq("verse_id", verseId);
  };

  const handleBookmark = async (verseId: string) => {
    if (!userId) { toast.error("Sign in to bookmark verses"); return; }
    // Optimistic update first
    setBookmarks(prev => [...prev, { id: crypto.randomUUID(), user_id: userId, verse_id: verseId, collection_name: "Default", note: null, created_at: new Date().toISOString() }]);
    await supabase.from("verse_bookmarks").delete().eq("user_id", userId).eq("verse_id", verseId);
    const { error } = await supabase.from("verse_bookmarks").insert({ user_id: userId, verse_id: verseId });
    if (error) { console.error("bookmark save error:", error); }
  };

  const handleRemoveBookmark = async (verseId: string) => {
    if (!userId) return;
    setBookmarks(prev => prev.filter(b => b.verse_id !== verseId));
    await supabase.from("verse_bookmarks").delete().eq("user_id", userId).eq("verse_id", verseId);
  };

  const handleSaveNote = async () => {
    if (!userId || !noteVerseId || !noteContent.trim()) return;
    await supabase.from("verse_notes").delete().eq("user_id", userId).eq("verse_id", noteVerseId);
    const { error } = await supabase.from("verse_notes").insert({
      user_id: userId, verse_id: noteVerseId, content: noteContent.trim(), is_private: true,
    });
    if (error) { console.error("note error:", error); toast.error("Failed to save note"); return; }
    toast.success("Note saved");
    setNoteVerseId(null);
    setNoteContent("");
  };

  const savePreferences = () => {
    if (!userId) return;
    startTransition(async () => {
      await supabase.from("user_preferences").update({
        font_size: fontSize,
        font_family: fontFamily,
        line_spacing: lineSpacing,
        show_verse_numbers: showVerseNumbers,
      }).eq("user_id", userId);
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#111111]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#FDFBF7]/95 dark:bg-[#111111]/95 backdrop-blur border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Link
            href={basePath}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to Bible"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </Link>
          <button
            onClick={() => setShowChapterNav(true)}
            className="flex items-center gap-1.5 bg-black/5 dark:bg-white/8 hover:bg-black/10 dark:hover:bg-white/12 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[14px]">{bookName} {chapterNum}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
          </button>
          <span className="text-[12px] text-muted-foreground font-medium px-2 py-1 rounded-full bg-black/5 dark:bg-white/8">KJV</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Reader settings"
          >
            <span className="text-[13px] font-bold tracking-tight text-foreground">AA</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="More options"
          >
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ── Chapter Content ── */}
      <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
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

      {/* ── Chapter Navigation ── */}
      <div className="border-t border-black/5 dark:border-white/5 px-5 py-4 flex items-center gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border border-border bg-card text-[14px] font-semibold active:scale-[0.97] transition-transform cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            {navigation.prevChapter ? `Chapter ${navigation.prevChapter}` : navigation.prevBook?.name ?? "Prev"}
          </Link>
        ) : <div className="flex-1" />}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl border border-border bg-card text-[14px] font-semibold active:scale-[0.97] transition-transform cursor-pointer"
          >
            {navigation.nextChapter ? `Chapter ${navigation.nextChapter}` : navigation.nextBook?.name ?? "Next"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <div className="flex-1" />}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={(open) => { setShowSettings(open); if (!open) savePreferences(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reader Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>Font Size: {fontSize}px</Label>
              <Slider
                min={12}
                max={32}
                step={1}
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as typeof fontFamily)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif (Classic)</SelectItem>
                  <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Line Spacing</Label>
              <Select value={lineSpacing} onValueChange={(v) => setLineSpacing(v as typeof lineSpacing)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="loose">Loose</SelectItem>
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
          <DialogHeader>
            <DialogTitle>Go to Chapter</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-5 gap-2 pr-4">
              {Array.from({ length: bookInfo.chapters }, (_, i) => i + 1).map((ch) => (
                <Button
                  key={ch}
                  variant={ch === chapterNum ? "default" : "outline"}
                  size="sm"
                  className="h-10 text-sm"
                  asChild
                >
                  <Link href={`${basePath}/${bookSlug}/${ch}`} onClick={() => setShowChapterNav(false)}>
                    {ch}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={!!noteVerseId} onOpenChange={(open) => { if (!open) { setNoteVerseId(null); setNoteContent(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          {noteVerse && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{noteVerse.reference}</p>
              <p className="text-sm font-serif italic">{noteVerse.text}</p>
            </div>
          )}
          <Textarea
            placeholder="Write your reflection, commentary, or note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setNoteVerseId(null); setNoteContent(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={!noteContent.trim()}>
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
