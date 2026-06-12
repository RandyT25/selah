import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ChapterReader } from "@/components/bible/ChapterReader";
import { getBookByName, getBookNameFromSlug, BIBLE_BOOKS, USFM_BOOK_IDS } from "@/lib/bible/books";
import { verseToId } from "@/lib/bible/verseId";
import type { BibleVerse, VerseHighlight, VerseBookmark, UserPreferences } from "@/types/database";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ book: string; chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { book, chapter } = await params;
  const bookName = getBookNameFromSlug(book);
  if (!bookName) return { title: "Bible" };
  return { title: `${bookName} ${chapter}` };
}

async function fetchKjv(bookName: string, chapterNum: number): Promise<BibleVerse[] | null> {
  const slug = bookName.toLowerCase().replace(/\s+/g, "+");
  const url = `https://bible-api.com/${slug}+${chapterNum}?translation=kjv`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetch(url, { next: { revalidate: 86400 } });
      if (resp.status === 404) return [];
      if (!resp.ok) {
        if (attempt === 0) await new Promise(r => setTimeout(r, 800));
        continue;
      }
      const data = await resp.json();
      const base = { book_id: "", chapter_id: "", translation: "KJV", api_id: null, cached_at: new Date().toISOString(), created_at: new Date().toISOString() };
      return (data.verses ?? []).map((v: { verse: number; text: string }) => ({
        ...base,
        id: verseToId(bookName, chapterNum, v.verse),
        verse_number: v.verse,
        text: v.text.trim(),
        reference: `${bookName} ${chapterNum}:${v.verse}`,
      }));
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, 800));
    }
  }
  return null;
}

type AytContentItem = string | { text?: string; noteId?: number; lineBreak?: boolean; [key: string]: unknown };
type AytChapterItem = { type: string; number?: number; content?: AytContentItem[] };

function extractAytText(content: AytContentItem[]): string {
  return content
    .map(c => {
      if (typeof c === "string") return c;
      if (typeof c === "object" && c !== null && typeof c.text === "string") return c.text;
      return "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchAyt(bookNumber: number, chapterNum: number): Promise<BibleVerse[] | null> {
  const bookId = USFM_BOOK_IDS[bookNumber - 1];
  if (!bookId) return null;
  const url = `https://bible.helloao.org/api/ind_ayt/${bookId}/${chapterNum}.json`;
  try {
    const resp = await fetch(url, { next: { revalidate: 86400 } });
    if (!resp.ok) return null;
    const data = await resp.json();
    const content: AytChapterItem[] = data?.chapter?.content ?? [];
    const base = { book_id: "", chapter_id: "", translation: "AYT", api_id: null, cached_at: new Date().toISOString(), created_at: new Date().toISOString() };
    return content
      .filter(item => item.type === "verse")
      .map(item => ({
        ...base,
        id: verseToId(bookId, chapterNum, item.number!),
        verse_number: item.number!,
        text: extractAytText(item.content ?? []),
        reference: `${bookId} ${chapterNum}:${item.number}`,
      }));
  } catch {
    return null;
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const bookName = getBookNameFromSlug(bookSlug);
  const chapterNum = parseInt(chapterStr);

  if (!bookName || isNaN(chapterNum) || chapterNum < 1) notFound();

  const bookInfo = getBookByName(bookName);
  if (!bookInfo || chapterNum > bookInfo.chapters) notFound();

  const cookieStore = await cookies();
  const isIndo = cookieStore.get("selah_language")?.value === "id";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [verses, { data: highlights }, { data: bookmarks }, { data: prefs }] = await Promise.all([
    isIndo ? fetchAyt(bookInfo.number, chapterNum) : fetchKjv(bookName, chapterNum),
    user ? supabase.from("verse_highlights").select("*").eq("user_id", user.id) : { data: [] as VerseHighlight[] },
    user ? supabase.from("verse_bookmarks").select("*").eq("user_id", user.id) : { data: [] as VerseBookmark[] },
    user ? supabase.from("user_preferences").select("*").eq("user_id", user.id).single() : { data: null as UserPreferences | null },
  ]);

  if (verses === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-8 text-center gap-4">
        <p className="text-[40px]">📖</p>
        <p className="text-[18px] font-semibold">Couldn&apos;t load {bookName} {chapterNum}</p>
        <p className="text-[14px] text-[#888]">The Bible API is temporarily unavailable.</p>
        <a href={`/bibleapp/bible/${bookSlug}/${chapterNum}`}
           className="mt-2 px-6 py-3 rounded-2xl bg-[#111] dark:bg-white text-white dark:text-black text-[15px] font-semibold">
          Try Again
        </a>
      </div>
    );
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < bookInfo.chapters ? chapterNum + 1 : null;
  const prevBook = BIBLE_BOOKS.find(b => b.number === bookInfo.number - 1);
  const nextBook = BIBLE_BOOKS.find(b => b.number === bookInfo.number + 1);

  return (
    <ChapterReader
      bookName={isIndo ? bookInfo.name_id : bookName}
      bookSlug={bookSlug}
      bookInfo={bookInfo}
      chapterNum={chapterNum}
      verses={verses}
      highlights={highlights ?? []}
      bookmarks={bookmarks ?? []}
      preferences={prefs ?? null}
      userId={user?.id}
      translation={isIndo ? "AYT" : "KJV"}
      navigation={{
        prevChapter,
        nextChapter,
        prevBook: prevBook ? { name: prevBook.name, slug: prevBook.name.toLowerCase().replace(/\s+/g, "-"), lastChapter: prevBook.chapters } : null,
        nextBook: nextBook ? { name: nextBook.name, slug: nextBook.name.toLowerCase().replace(/\s+/g, "-") } : null,
      }}
      basePath="/bibleapp/bible"
    />
  );
}
