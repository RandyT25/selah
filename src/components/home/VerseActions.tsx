"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Copy, Share2, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";
import { BIBLE_BOOKS } from "@/lib/bible/books";

interface VerseActionsProps {
  verseText: string;
  verseReference: string;
}

// Match a raw book name string against the authoritative BIBLE_BOOKS list.
// Returns the canonical slug or null if no match.
function findBookSlug(rawName: string): string | null {
  const norm = rawName.toLowerCase().trim();
  // 1. Exact name match
  let book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === norm);
  // 2. Abbreviation match
  if (!book) book = BIBLE_BOOKS.find(b => b.abbreviation.toLowerCase() === norm);
  // 3. Starts-with match (handles "Psalm" → "Psalms", "Song" → "Song of Songs")
  if (!book) book = BIBLE_BOOKS.find(b => b.name.toLowerCase().startsWith(norm));
  // 4. Raw name starts with book name (handles full name already included)
  if (!book) book = BIBLE_BOOKS.find(b => norm.startsWith(b.name.toLowerCase()));
  return book ? book.name.toLowerCase().replace(/\s+/g, "-") : null;
}

function parseBibleLink(reference: string): string {
  try {
    // Format: "Jeremiah 29:11" | "1 John 4:7" | "Psalm 23:1" | "Song of Solomon 1:2"
    const colonIdx = reference.indexOf(":");
    if (colonIdx === -1) return "/bibleapp/bible";

    const bookAndChapter = reference.slice(0, colonIdx).trim(); // "Jeremiah 29"
    const parts = bookAndChapter.split(" ");
    const chapter = parseInt(parts[parts.length - 1], 10);
    const rawBook = parts.slice(0, -1).join(" "); // "Jeremiah"

    if (isNaN(chapter) || !rawBook) return "/bibleapp/bible";

    const slug = findBookSlug(rawBook);
    if (!slug) return "/bibleapp/bible";

    return `/bibleapp/bible/${slug}/${chapter}`;
  } catch {
    return "/bibleapp/bible";
  }
}

export function VerseActions({ verseText, verseReference }: VerseActionsProps) {
  const likeKey = `selah_liked_${verseReference}`;
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const bibleLink = parseBibleLink(verseReference);

  useEffect(() => {
    try { setLiked(localStorage.getItem(likeKey) === "1"); } catch {}
  }, [likeKey]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${verseText.trim()}" — ${verseReference}`);
      setCopied(true);
      toast.success("Verse copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const handleShare = async () => {
    const text = `"${verseText.trim()}" — ${verseReference}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: verseReference, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Verse copied for sharing");
      }
    } catch {
      // user cancelled share sheet — no error needed
    }
  };

  return (
    <div className="flex items-center border-t border-white/10 pt-2 -mx-1">
      <button
        onClick={() => {
          const next = !liked;
          setLiked(next);
          try { next ? localStorage.setItem(likeKey, "1") : localStorage.removeItem(likeKey); } catch {}
        }}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer active:opacity-60"
      >
        <Heart
          className="h-4 w-4 transition-colors"
          strokeWidth={1.5}
          style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.4)", fill: liked ? "#ef4444" : "none" }}
        />
        <span className="text-[12px] transition-colors" style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
          {liked ? "Liked" : "Like"}
        </span>
      </button>

      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer active:opacity-60"
      >
        {copied
          ? <Check className="h-4 w-4 text-green-400" strokeWidth={1.5} />
          : <Copy className="h-4 w-4 text-white/40" strokeWidth={1.5} />
        }
        <span className={`text-[12px] ${copied ? "text-green-400" : "text-white/40"}`}>
          {copied ? "Copied" : "Copy"}
        </span>
      </button>

      <button
        onClick={handleShare}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white/40 active:opacity-60 transition-colors cursor-pointer"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-[12px]">Share</span>
      </button>

      <Link
        href={bibleLink}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white/40 active:opacity-60 transition-colors"
      >
        <BookOpen className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-[12px]">Read</span>
      </Link>
    </div>
  );
}
