"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Copy, Share2, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";

interface VerseActionsProps {
  verseText: string;
  verseReference: string;
}

function parseBibleLink(reference: string): string {
  // "Jeremiah 29:11" → /app/bible/jeremiah/29
  // "1 John 4:7"    → /app/bible/1-john/4
  try {
    const [bookChapterPart] = reference.split(":");
    const parts = bookChapterPart.trim().split(" ");
    const chapter = parseInt(parts[parts.length - 1]);
    const bookName = parts.slice(0, -1).join(" ");
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, "-");
    if (!isNaN(chapter) && bookSlug) return `/app/bible/${bookSlug}/${chapter}`;
  } catch {
    // fall through
  }
  return "/app/bible";
}

export function VerseActions({ verseText, verseReference }: VerseActionsProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const bibleLink = parseBibleLink(verseReference);

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
      // user cancelled share — no error toast needed
    }
  };

  return (
    <div className="flex items-center border-t border-white/10 pt-2 -mx-1">
      <button
        onClick={() => setLiked(l => !l)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer active:opacity-60"
      >
        <Heart
          className="h-4 w-4"
          strokeWidth={1.5}
          style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.4)", fill: liked ? "#ef4444" : "none" }}
        />
        <span className="text-[12px]" style={{ color: liked ? "#ef4444" : "rgba(255,255,255,0.4)" }}>
          {liked ? "Liked" : "Like"}
        </span>
      </button>

      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer active:opacity-60"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" strokeWidth={1.5} />
        ) : (
          <Copy className="h-4 w-4 text-white/40" strokeWidth={1.5} />
        )}
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
        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-white/40 active:opacity-60 transition-colors cursor-pointer"
      >
        <BookOpen className="h-4 w-4" strokeWidth={1.5} />
        <span className="text-[12px]">Read</span>
      </Link>
    </div>
  );
}
