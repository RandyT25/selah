import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BIBLE_BOOKS } from "@/lib/bible/books";
import { BibleSearch } from "@/components/bible/BibleSearch";
import { getServerT } from "@/lib/utils/server-i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bible" };

export default async function BiblePage() {
  const [supabase, t, cookieStore] = await Promise.all([createClient(), getServerT(), cookies()]);
  const isIndo = cookieStore.get("selah_language")?.value === "id";
  const { data: { user } } = await supabase.auth.getUser();

  const histResult = user ? await supabase
    .from("reading_history")
    .select("*, bible_books(name), bible_chapters(chapter_number)")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false })
    .limit(5) : { data: null };
  const readingHistory = (histResult.data ?? null) as Record<string, unknown>[] | null;

  const genreColors: Record<string, string> = {
    Law: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    History: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Wisdom: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Poetry: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    Prophecy: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Gospel: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Epistle: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("bible", "title")}</h1>
          <p className="text-sm text-muted-foreground">{t("bible", "books_count")} · {isIndo ? "AYT" : "KJV"}</p>
        </div>
      </div>

      {/* Continue Reading */}
      {readingHistory && readingHistory.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("bible", "continue_reading")}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {readingHistory.map((history: Record<string, unknown>) => {
              const book = history.bible_books as { name: string } | null;
              const chapter = history.bible_chapters as { chapter_number: number } | null;
              if (!book || !chapter) return null;
              return (
                <Link
                  key={history.id as string}
                  href={`/bibleapp/bible/${book.name.toLowerCase().replace(/\s+/g, "-")}/${chapter.chapter_number}`}
                  className="shrink-0"
                >
                  <Card className="card-hover w-40">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm truncate">{book.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("bible", "chapter")} {chapter.chapter_number}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                        <span>{t("bible", "continue")}</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Book Grid */}
      <BibleSearch
        books={BIBLE_BOOKS}
        isIndo={isIndo}
        placeholder={t("bible", "search_placeholder")}
        chaptersLabel={t("bible", "chapters")}
        goToLabel={t("bible", "search_go_to")}
        chapterLabel={t("bible", "chapter")}
        genreColors={genreColors}
      />
    </div>
  );
}
