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
    const verse = verses.find(v => v.id === verseId);
    if (!verse) return;

    const { error } = await supabase.from("verse_highlights").upsert({
      user_id: userId,
      verse_id: verseId,
      color,
    }, { onConflict: "user_id,verse_id" });

    if (error) { toast.error("Failed to save highlight"); return; }
    setHighlights(prev => {
      const filtered = prev.filter(h => h.verse_id !== verseId);
      return [...filtered, { id: crypto.randomUUID(), user_id: userId, verse_id: verseId, color, note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    });
  };

  const handleRemoveHighlight = async (verseId: string) => {
    if (!userId) return;
    await supabase.from("verse_highlights").delete().eq("user_id", userId).eq("verse_id", verseId);
    setHighlights(prev => prev.filter(h => h.verse_id !== verseId));
  };

  const handleBookmark = async (verseId: string) => {
    if (!userId) { toast.error("Sign in to bookmark verses"); return; }
    const { error } = await supabase.from("verse_bookmarks").insert({ user_id: userId, verse_id: verseId });
    if (error) { toast.error("Failed to bookmark"); return; }
    setBookmarks(prev => [...prev, { id: crypto.randomUUID(), user_id: userId, verse_id: verseId, collection_name: "Default", note: null, created_at: new Date().toISOString() }]);
  };

  const handleRemoveBookmark = async (verseId: string) => {
    if (!userId) return;
    await supabase.from("verse_bookmarks").delete().eq("user_id", userId).eq("verse_id", verseId);
    setBookmarks(prev => prev.filter(b => b.verse_id !== verseId));
  };

  const handleSaveNote = async () => {
    if (!userId || !noteVerseId || !noteContent.trim()) return;
    const { error } = await supabase.from("verse_notes").upsert({
      user_id: userId,
      verse_id: noteVerseId,
      content: noteContent.trim(),
    }, { onConflict: "user_id,verse_id" });

    if (error) { toast.error("Failed to save note"); return; }
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
    <div className="min-h-screen bg-background">
      {/* Reader Toolbar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={basePath}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <button
              onClick={() => setShowChapterNav(true)}
              className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {bookName} {chapterNum}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold font-serif mb-8 text-center">
          {bookName} {chapterNum}
        </h2>

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

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t">
          {prevHref ? (
            <Button variant="outline" asChild>
              <Link href={prevHref}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {navigation.prevChapter ? `Chapter ${navigation.prevChapter}` : navigation.prevBook?.name}
              </Link>
            </Button>
          ) : <div />}

          <span className="text-xs text-muted-foreground">KJV</span>

          {nextHref ? (
            <Button variant="outline" asChild>
              <Link href={nextHref}>
                {navigation.nextChapter ? `Chapter ${navigation.nextChapter}` : navigation.nextBook?.name}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : <div />}
        </div>
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
