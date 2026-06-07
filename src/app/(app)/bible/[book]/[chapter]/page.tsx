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

async function fetchVerses(bookName: string, chapterNum: number, translation: string): Promise<BibleVerse[]> {
  // Always go straight to the free API — DB caching is a future optimisation
  // (bible_chapters table is not pre-seeded, so DB lookups return nothing)
  return fetchFromFreeApi(bookName, chapterNum);
}

async function fetchFromFreeApi(bookName: string, chapterNum: number): Promise<BibleVerse[]> {
  try {
    const slug = bookName.toLowerCase().replace(/\s+/g, "+");
    const resp = await fetch(
      `https://bible-api.com/${slug}+${chapterNum}?translation=kjv`,
      { next: { revalidate: 86400 } }
    );
    if (!resp.ok) return getMockVerses(bookName, chapterNum);
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
    return getMockVerses(bookName, chapterNum);
  }
}

function getMockVerses(bookName: string, chapter: number): BibleVerse[] {
  const base = { book_id: "", chapter_id: "", translation: "KJV", api_id: null, cached_at: new Date().toISOString(), created_at: new Date().toISOString() };
  if (bookName === "Genesis" && chapter === 1) {
    return [
      { ...base, id: "mock-1", verse_number: 1, text: "In the beginning God created the heaven and the earth.", reference: "Genesis 1:1" },
      { ...base, id: "mock-2", verse_number: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.", reference: "Genesis 1:2" },
      { ...base, id: "mock-3", verse_number: 3, text: "And God said, Let there be light: and there was light.", reference: "Genesis 1:3" },
      { ...base, id: "mock-4", verse_number: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness.", reference: "Genesis 1:4" },
      { ...base, id: "mock-5", verse_number: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.", reference: "Genesis 1:5" },
    ];
  }
  return [
    { ...base, id: "mock-1", verse_number: 1, text: `Configure your BIBLE_API_KEY environment variable to load ${bookName} ${chapter}. Add your API.Bible key to .env.local to fetch real Scripture content.`, reference: `${bookName} ${chapter}:1` },
  ];
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

  const [
    verses,
    { data: highlights },
    { data: bookmarks },
    { data: prefs },
  ] = await Promise.all([
    fetchVerses(bookName, chapterNum, "KJV"),
    user ? supabase.from("verse_highlights").select("*").eq("user_id", user.id) : { data: [] as VerseHighlight[] },
    user ? supabase.from("verse_bookmarks").select("*").eq("user_id", user.id) : { data: [] as VerseBookmark[] },
    user ? supabase.from("user_preferences").select("*").eq("user_id", user.id).single() : { data: null as UserPreferences | null },
  ]);

  if (user && verses.length > 0 && verses[0].book_id && verses[0].chapter_id) {
    await supabase.from("reading_history").upsert({
      user_id: user.id,
      book_id: verses[0].book_id,
      chapter_id: verses[0].chapter_id,
      translation: "KJV",
      read_at: new Date().toISOString(),
    }, { onConflict: "user_id,chapter_id,translation" });
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < bookInfo.chapters ? chapterNum + 1 : null;
  const prevBook = BIBLE_BOOKS.find(b => b.number === bookInfo.number - 1);
  const nextBook = BIBLE_BOOKS.find(b => b.number === bookInfo.number + 1);

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
