import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible/books";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bible" };

const genreColor: Record<string, string> = {
  Law:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  History:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Wisdom:   "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Poetry:   "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Prophecy: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Gospel:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Epistle:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Apocalyptic: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function BiblePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const histResult = await supabase
    .from("reading_history")
    .select("*, bible_books(name), bible_chapters(chapter_number)")
    .eq("user_id", user.id)
    .order("read_at", { ascending: false })
    .limit(1);
  const lastRead = histResult.data?.[0] as Record<string, unknown> | null;

  const bookSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-2xl border-b border-border/30">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-[22px] font-bold mb-3">Bible</h1>
          {/* Search bar */}
          <Link
            href="/app/search"
            className="flex items-center gap-3 bg-muted/80 rounded-2xl px-4 py-3 w-full"
          >
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Search the Bible...</span>
          </Link>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Continue Reading */}
        {lastRead && (
          <div className="mt-4 mb-5">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Continue Reading</h2>
            <Link
              href={`/app/bible/${bookSlug((lastRead?.bible_books as Record<string, string>)?.name ?? "genesis")}/${(lastRead?.bible_chapters as Record<string, number>)?.chapter_number ?? 1}`}
              className="flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 active:scale-[0.98] transition-transform"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">
                  {String((lastRead?.bible_books as Record<string, string>)?.name ?? "Gen").slice(0, 3)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm">{(lastRead?.bible_books as Record<string, string>)?.name ?? "Genesis"}</p>
                <p className="text-xs text-muted-foreground">Chapter {(lastRead?.bible_chapters as Record<string, number>)?.chapter_number ?? 1}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Old Testament */}
        <div className="mb-6">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Old Testament</h2>
          <div className="grid grid-cols-3 gap-2">
            {OLD_TESTAMENT.map((book) => (
              <Link
                key={book.number}
                href={`/app/bible/${bookSlug(book.name)}/1`}
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-3 px-2 active:scale-[0.96] transition-transform gap-1 min-h-[72px]"
              >
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${genreColor[book.genre] ?? "bg-muted text-muted-foreground"}`}>
                  {book.genre}
                </span>
                <span className="text-[12px] font-semibold text-center leading-tight mt-0.5">{book.name}</span>
                <span className="text-[10px] text-muted-foreground">{book.chapters} ch</span>
              </Link>
            ))}
          </div>
        </div>

        {/* New Testament */}
        <div>
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">New Testament</h2>
          <div className="grid grid-cols-3 gap-2">
            {NEW_TESTAMENT.map((book) => (
              <Link
                key={book.number}
                href={`/app/bible/${bookSlug(book.name)}/1`}
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-3 px-2 active:scale-[0.96] transition-transform gap-1 min-h-[72px]"
              >
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${genreColor[book.genre] ?? "bg-muted text-muted-foreground"}`}>
                  {book.genre}
                </span>
                <span className="text-[12px] font-semibold text-center leading-tight mt-0.5">{book.name}</span>
                <span className="text-[10px] text-muted-foreground">{book.chapters} ch</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
