"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { BookInfo } from "@/lib/bible/books";

interface BibleSearchProps {
  books: BookInfo[];
  isIndo: boolean;
  placeholder: string;
  chaptersLabel: string;
  goToLabel: string;
  chapterLabel: string;
  genreColors: Record<string, string>;
}

interface ParsedQuery {
  book: BookInfo | null;
  chapter: number | null;
  verseRange: string | null; // e.g. "5" or "5-10"
}

function parseQuery(query: string, books: BookInfo[]): ParsedQuery {
  const q = query.trim();
  if (!q) return { book: null, chapter: null, verseRange: null };

  // Handles: "Matius 8 : 5-10", "John 3:16", "Gen 1 : 1", "Amsal 3:5-6"
  // Spaces around colon are optional; verse range (N-M) or single verse (N)
  const refMatch = q.match(/^(.+?)\s+(\d+)\s*(?::\s*(\d+(?:\s*-\s*\d+)?))?$/);
  if (refMatch) {
    const [, bookPart, chapterStr, verseStr] = refMatch;
    const matched = findBook(bookPart.trim(), books);
    if (matched) {
      const chapter = parseInt(chapterStr);
      const verseRange = verseStr ? verseStr.replace(/\s/g, "") : null;
      return { book: matched, chapter, verseRange };
    }
  }

  return { book: findBook(q, books), chapter: null, verseRange: null };
}

function findBook(query: string, books: BookInfo[]): BookInfo | null {
  const q = query.toLowerCase().trim();
  return (
    books.find(b => b.name.toLowerCase() === q || b.name_id.toLowerCase() === q || b.abbreviation.toLowerCase() === q) ??
    books.find(b => b.name.toLowerCase().startsWith(q) || b.name_id.toLowerCase().startsWith(q)) ??
    null
  );
}

function filterBooks(query: string, books: BookInfo[]): BookInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return books;
  // Strip trailing chapter reference so "john 3" still shows John
  const bookPart = q.replace(/\s+\d+.*$/, "").trim();
  if (!bookPart) return books;
  return books.filter(
    b =>
      b.name.toLowerCase().includes(bookPart) ||
      b.name_id.toLowerCase().includes(bookPart) ||
      b.abbreviation.toLowerCase().includes(bookPart)
  );
}

function bookSlug(book: BookInfo) {
  return book.name.toLowerCase().replace(/\s+/g, "-");
}

export function BibleSearch({
  books,
  isIndo,
  placeholder,
  chaptersLabel,
  goToLabel,
  chapterLabel,
  genreColors,
}: BibleSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const parsed = useMemo(() => parseQuery(query, books), [query, books]);
  const filtered = useMemo(() => filterBooks(query, books), [query, books]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (parsed.book) {
      const ch = parsed.chapter && parsed.chapter <= parsed.book.chapters ? parsed.chapter : 1;
      router.push(`/bibleapp/bible/${bookSlug(parsed.book)}/${ch}`);
    } else if (filtered.length === 1) {
      router.push(`/bibleapp/bible/${bookSlug(filtered[0])}/1`);
    }
  };

  const displayName = (book: BookInfo) => isIndo ? book.name_id : book.name;

  const validChapter =
    parsed.book && parsed.chapter && parsed.chapter >= 1 && parsed.chapter <= parsed.book.chapters
      ? parsed.chapter
      : null;

  const goToHref = parsed.book
    ? `/bibleapp/bible/${bookSlug(parsed.book)}/${validChapter ?? 1}`
    : null;

  const goToLabel2 = parsed.book
    ? [
        displayName(parsed.book),
        validChapter ? `· ${chapterLabel} ${validChapter}` : "",
        validChapter && parsed.verseRange ? `: ${parsed.verseRange}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Go-to pill — shown when query resolves to a specific book (+ chapter) */}
      {goToHref && query.trim() && (
        <Link
          href={goToHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          {goToLabel} {goToLabel2}
        </Link>
      )}

      {/* Filtered book grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map(book => (
            <Link
              key={book.number}
              href={`/bibleapp/bible/${bookSlug(book)}/1`}
              className="group"
            >
              <Card className="card-hover h-full">
                <CardContent className="p-3">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                    {displayName(book)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {book.chapters} {chaptersLabel}
                  </p>
                  <span
                    className={`inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${genreColors[book.genre] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {book.genre}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
