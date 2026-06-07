"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Result {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const bookSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const TOPICS = [
  "Love", "Hope", "Peace", "Faith", "Anxiety", "Strength", "Healing", "Grace",
  "Prayer", "Forgiveness", "Salvation", "Wisdom",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/bible/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          // API returns { results: [...] }
          setResults(data.results ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black">

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 pt-6 pb-4">
        <button onClick={() => router.back()} className="text-[#888] cursor-pointer flex-shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl px-3 h-[44px]">
          <Search className="h-4 w-4 text-[#888] flex-shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verses, topics…"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#888]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#888] cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Topics (shown when no query) */}
      {!query && (
        <div className="px-5 pt-2">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Topics</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setQuery(topic)}
                className="rounded-full border border-[#E0E0E0] dark:border-[#333] px-4 py-2 text-[13px] font-medium active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-5 pt-4">
          <p className="text-[14px] text-[#888]">Searching…</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="border-t border-[#F0F0F0] dark:border-[#222] mt-4">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((r, i) => {
            // r.book is the full reference string e.g. "John 3:16"
            // Parse out book name + chapter for the link
            const refMatch = r.book.match(/^(.+?)\s+(\d+)/);
            const linkBook = refMatch ? bookSlug(refMatch[1]) : bookSlug(r.book);
            const linkChapter = refMatch ? parseInt(refMatch[2]) : 1;
            return (
              <Link
                key={r.id}
                href={`/app/bible/${linkBook}/${linkChapter}`}
                className={`flex flex-col px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                  i > 0 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""
                }`}
              >
                <p className="text-[11px] font-semibold text-[#888] mb-1">{r.book}</p>
                <p className="text-[14px] leading-relaxed line-clamp-3">{r.text}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* No results */}
      {query.length >= 3 && !loading && results.length === 0 && (
        <div className="flex flex-col items-center pt-16 px-8 text-center">
          <p className="text-[17px] font-semibold">No results for "{query}"</p>
          <p className="text-[14px] text-[#888] mt-1">Try different keywords</p>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
