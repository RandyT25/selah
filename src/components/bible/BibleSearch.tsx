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
}

function parseQuery(query: string, books: BookInfo[]): ParsedQuery {
  const q = query.trim();
  if (!q) return { book: null, chapter: null };

  // Try to match "Book Chapter" or "Book Chapter:Verse"
  const refMatch = q.match(/^(.+?)\s+(\d+)(?::\d+)?$/);
  if (refMatch) {
    const [, bookPart, chapterStr] = refMatch;
    const matched = findBook(bookPart, books);
    if (matched) return { book: matched, chapter: parseInt(chapterStr) };
  }

  return { book: findBook(q, books), chapter: null };
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

  // Show go-to pill when there's an exact book match with a chapter
  const goToHref =
    parsed.book && parsed.chapter && parsed.chapter >= 1 && parsed.chapter <= parsed.book.chapters
      ? `/bibleapp/bible/${bookSlug(parsed.book)}/${parsed.chapter}`
      : parsed.book
      ? `/bibleapp/bible/${bookSlug(parsed.book)}/1`
      : null;

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
          {goToLabel} {displayName(parsed.book!)}
          {parsed.chapter && parsed.chapter >= 1 && parsed.chapter <= parsed.book!.chapters
            ? ` · ${chapterLabel} ${parsed.chapter}`
            : ""}
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
