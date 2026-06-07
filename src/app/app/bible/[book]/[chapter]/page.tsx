import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChapterReader } from "@/components/bible/ChapterReader";
import { getBookByName, getBookNameFromSlug, BIBLE_BOOKS } from "@/lib/bible/books";
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

async function fetchFromApi(bookName: string, chapterNum: number): Promise<BibleVerse[]> {
  try {
    const slug = bookName.toLowerCase().replace(/\s+/g, "+");
    const resp = await fetch(
      `https://bible-api.com/${slug}+${chapterNum}?translation=kjv`,
      { next: { revalidate: 86400 } }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    const base = { book_id: "", chapter_id: "", translation: "KJV", api_id: null, cached_at: new Date().toISOString(), created_at: new Date().toISOString() };
    return (data.verses ?? []).map((v: { verse: number; text: string }) => ({
      ...base,
      id: `free-${bookName}-${chapterNum}-${v.verse}`,
      verse_number: v.verse,
      text: v.text.trim(),
      reference: `${bookName} ${chapterNum}:${v.verse}`,
    }));
  } catch {
    return [];
  }
}

export default async function ChapterPage({ params }: PageProps) {
  const { book: bookSlug, chapter: chapterStr } = await params;
  const bookName = getBookNameFromSlug(bookSlug);
  const chapterNum = parseInt(chapterStr);

  if (!bookName || isNaN(chapterNum) || chapterNum < 1) notFound();

  const bookInfo = getBookByName(bookName);
  if (!bookInfo || chapterNum > bookInfo.chapters) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [verses, { data: highlights }, { data: bookmarks }, { data: prefs }] = await Promise.all([
    fetchFromApi(bookName, chapterNum),
    user ? supabase.from("verse_highlights").select("*").eq("user_id", user.id) : { data: [] as VerseHighlight[] },
    user ? supabase.from("verse_bookmarks").select("*").eq("user_id", user.id) : { data: [] as VerseBookmark[] },
    user ? supabase.from("user_preferences").select("*").eq("user_id", user.id).single() : { data: null as UserPreferences | null },
  ]);

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < bookInfo.chapters ? chapterNum + 1 : null;
  const prevBook = BIBLE_BOOKS.find((b) => b.number === bookInfo.number - 1);
  const nextBook = BIBLE_BOOKS.find((b) => b.number === bookInfo.number + 1);

  return (
    <ChapterReader
      bookName={bookName}
      bookSlug={bookSlug}
      bookInfo={bookInfo}
      chapterNum={chapterNum}
      verses={verses}
      highlights={highlights ?? []}
      bookmarks={bookmarks ?? []}
      preferences={prefs ?? null}
      userId={user?.id}
      navigation={{
        prevChapter,
        nextChapter,
        prevBook: prevBook ? { name: prevBook.name, slug: prevBook.name.toLowerCase().replace(/\s+/g, "-"), lastChapter: prevBook.chapters } : null,
        nextBook: nextBook ? { name: nextBook.name, slug: nextBook.name.toLowerCase().replace(/\s+/g, "-") } : null,
      }}
    />
  );
}
