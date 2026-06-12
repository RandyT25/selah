import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible/books";
import { getServerT } from "@/lib/utils/server-i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bible" };

export default async function BiblePage() {
  const [supabase, t] = await Promise.all([createClient(), getServerT()]);
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

  const BookList = ({ books }: { books: typeof OLD_TESTAMENT }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {books.map((book) => (
        <Link
          key={book.number}
          href={`/bibleapp/bible/${book.name.toLowerCase().replace(/\s+/g, "-")}/1`}
          className="group"
        >
          <Card className="card-hover h-full">
            <CardContent className="p-3">
              <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                {book.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {book.chapters} {t("bible", "chapters")}
              </p>
              <span className={`inline-block mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${genreColors[book.genre] ?? "bg-gray-100 text-gray-800"}`}>
                {book.genre}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("bible", "title")}</h1>
          <p className="text-sm text-muted-foreground">{t("bible", "books_count")} · KJV</p>
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

      {/* Book Navigator */}
      <Tabs defaultValue="ot">
        <TabsList className="mb-4">
          <TabsTrigger value="ot">{t("bible", "old_testament")}</TabsTrigger>
          <TabsTrigger value="nt">{t("bible", "new_testament")}</TabsTrigger>
        </TabsList>
        <TabsContent value="ot">
          <BookList books={OLD_TESTAMENT} />
        </TabsContent>
        <TabsContent value="nt">
          <BookList books={NEW_TESTAMENT} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
