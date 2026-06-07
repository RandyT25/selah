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
    <div className="min-h-full bg-white dark:bg-black">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-bold tracking-tight">Bible</h1>
      </div>

      {/* ── Search ── */}
      <div className="px-5 mb-6">
        <Link
          href="/app/search"
          className="flex items-center gap-2.5 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl px-4 h-[44px] w-full active:opacity-70 transition-opacity"
        >
          <Search className="h-4 w-4 text-[#888]" strokeWidth={1.5} />
          <span className="text-[15px] text-[#888]">Search verses, books…</span>
        </Link>
      </div>

      {/* ── Continue Reading ── */}
      {lastRead && lastBook && (
        <div className="border-t border-[#F0F0F0] dark:border-[#222]">
          <Link
            href={`/app/bible/${bookSlug(lastBook)}/${lastChapter ?? 1}`}
            className="flex items-center px-5 py-4 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors"
          >
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-0.5">Continue</p>
              <p className="text-[16px] font-semibold">{lastBook} {lastChapter ?? 1}</p>
            </div>
            <span className="text-[13px] text-[#888]">Open →</span>
          </Link>
        </div>
      )}

      {/* ── Topics ── */}
      <div className="px-5 py-5 border-t border-[#F0F0F0] dark:border-[#222]">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Topics</p>
        <div className="grid grid-cols-4 gap-2">
          {TOPICS.map(({ label, bg }) => (
            <Link
              key={label}
              href={`/app/search?q=${label.toLowerCase()}`}
              className="rounded-xl h-[52px] flex items-center justify-center active:opacity-70 transition-opacity"
              style={{ backgroundColor: bg }}
            >
              <span className="text-white font-bold text-[11px] uppercase tracking-wide">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Old Testament ── */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222] pt-5 pb-2">
        <div className="flex items-center justify-between px-5 mb-3">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em]">Old Testament</p>
          <p className="text-[11px] text-[#888]">{OLD_TESTAMENT.length} books</p>
        </div>
        <div className="grid grid-cols-3">
          {OLD_TESTAMENT.map((book, i) => (
            <Link
              key={book.number}
              href={`/app/bible/${bookSlug(book.name)}/1`}
              className={`px-5 py-3 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                i % 3 !== 2 ? "border-r border-[#F0F0F0] dark:border-[#222]" : ""
              } ${i >= 3 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
            >
              <p className="text-[13px] font-semibold leading-snug">{book.name}</p>
              <p className="text-[11px] text-[#888] mt-0.5">{book.chapters} ch</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── New Testament ── */}
      <div className="border-t border-[#F0F0F0] dark:border-[#222] pt-5 pb-28">
        <div className="flex items-center justify-between px-5 mb-3">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em]">New Testament</p>
          <p className="text-[11px] text-[#888]">{NEW_TESTAMENT.length} books</p>
        </div>
        <div className="grid grid-cols-3">
          {NEW_TESTAMENT.map((book, i) => (
            <Link
              key={book.number}
              href={`/app/bible/${bookSlug(book.name)}/1`}
              className={`px-5 py-3 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors ${
                i % 3 !== 2 ? "border-r border-[#F0F0F0] dark:border-[#222]" : ""
              } ${i >= 3 ? "border-t border-[#F0F0F0] dark:border-[#222]" : ""}`}
            >
              <p className="text-[13px] font-semibold leading-snug">{book.name}</p>
              <p className="text-[11px] text-[#888] mt-0.5">{book.chapters} ch</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
