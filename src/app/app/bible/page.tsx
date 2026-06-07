import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "@/lib/bible/books";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bible" };

const TOPICS = [
  { label: "Love",      bg: "#8B2330" },
  { label: "Healing",   bg: "#276749" },
  { label: "Anxiety",   bg: "#1B5E72" },
  { label: "Hope",      bg: "#2563A8" },
  { label: "Peace",     bg: "#5B4397" },
  { label: "Strength",  bg: "#B45309" },
  { label: "Faith",     bg: "#065F46" },
  { label: "Grace",     bg: "#9D174D" },
];

const bookSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

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
  const lastBook = (lastRead?.bible_books as Record<string, string>)?.name;
  const lastChapter = (lastRead?.bible_chapters as Record<string, number>)?.chapter_number;

  return (
    <div className="min-h-full bg-background">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-[28px] font-bold tracking-tight mb-4">Bible</h1>
        <Link
          href="/app/search"
          className="flex items-center gap-2.5 bg-muted rounded-xl px-4 py-3 w-full"
        >
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-[15px] text-muted-foreground">Search</span>
        </Link>
      </div>

      {/* ── Continue Reading ── */}
      {lastRead && lastBook && (
        <div className="px-5 mb-5">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Continue Reading</p>
          <Link
            href={`/app/bible/${bookSlug(lastBook)}/${lastChapter ?? 1}`}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-[11px]">{lastBook.slice(0, 3).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[14px]">{lastBook}</p>
              <p className="text-[12px] text-muted-foreground">Chapter {lastChapter ?? 1}</p>
            </div>
            <span className="text-[13px] text-muted-foreground font-medium">Open →</span>
          </Link>
        </div>
      )}

      {/* ── Search by Topic ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">Search by Topic</h2>
          <Link href="/app/search" className="text-[13px] text-muted-foreground">See All</Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map(({ label, bg }) => (
            <Link
              key={label}
              href={`/app/search?q=${label.toLowerCase()}`}
              className="rounded-xl px-4 py-3.5 active:opacity-75 transition-opacity"
              style={{ backgroundColor: bg }}
            >
              <span className="text-white font-bold text-[14px] uppercase tracking-wide">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Old Testament ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">Old Testament</h2>
          <span className="text-[13px] text-muted-foreground">{OLD_TESTAMENT.length} books</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {OLD_TESTAMENT.map((book) => (
            <Link
              key={book.number}
              href={`/app/bible/${bookSlug(book.name)}/1`}
              className="flex flex-col rounded-xl border border-border bg-card py-3 px-3 active:bg-muted/60 transition-colors"
            >
              <span className="text-[13px] font-semibold leading-tight">{book.name}</span>
              <span className="text-[11px] text-muted-foreground mt-1">{book.chapters} ch</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── New Testament ── */}
      <div className="px-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">New Testament</h2>
          <span className="text-[13px] text-muted-foreground">{NEW_TESTAMENT.length} books</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {NEW_TESTAMENT.map((book) => (
            <Link
              key={book.number}
              href={`/app/bible/${bookSlug(book.name)}/1`}
              className="flex flex-col rounded-xl border border-border bg-card py-3 px-3 active:bg-muted/60 transition-colors"
            >
              <span className="text-[13px] font-semibold leading-tight">{book.name}</span>
              <span className="text-[11px] text-muted-foreground mt-1">{book.chapters} ch</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
