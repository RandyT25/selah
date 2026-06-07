"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search as SearchIcon, BookOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface VerseResult {
  id: string;
  text: string;
  reference: string;
  bible_books: { name: string; abbreviation: string } | null;
  bible_chapters: { chapter_number: number } | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VerseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const resp = await fetch(`/api/bible/search?q=${encodeURIComponent(q)}`);
      const data = await resp.json();
      setResults(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const getBookSlug = (bookName: string) => bookName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SearchIcon className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Search Scripture</h1>
      </div>

      <div className="relative mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for verses, topics, or phrases..."
          icon={<SearchIcon className="h-4 w-4" />}
          iconRight={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          className="h-12 text-base"
          autoFocus
        />
      </div>

      {/* Quick searches */}
      {!query && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {["love", "faith", "hope", "grace", "peace", "forgiveness", "salvation", "prayer"].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => setQuery(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} results for "{query}"</p>
          {results.map((verse) => {
            const book = verse.bible_books;
            const chapter = verse.bible_chapters;
            const bookSlug = book ? getBookSlug(book.name) : "";
            const chapterNum = chapter?.chapter_number ?? 1;

            return (
              <Link
                key={verse.id}
                href={`/bible/${bookSlug}/${chapterNum}`}
              >
                <Card className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        {verse.reference}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Read chapter</span>
                      </div>
                    </div>
                    <p className="font-serif text-sm leading-relaxed">
                      {highlightText(verse.text, query)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && query.length >= 3 && results.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try different keywords or phrases</p>
        </div>
      )}
    </div>
  );
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/20 rounded px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}
