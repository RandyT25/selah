import { BIBLE_BOOKS, USFM_BOOK_IDS } from "./books";

export type AytContentItem =
  | string
  | { text?: string; noteId?: number; lineBreak?: boolean; [key: string]: unknown };

export type AytChapterItem = { type: string; number?: number; content?: AytContentItem[] };

export function extractAytText(content: AytContentItem[]): string {
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

// Parse "Proverbs 3:5-6", "John 3:16", "1 Corinthians 13:4-5", etc.
function parseRef(ref: string) {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const [, bookName, ch, sv, ev] = match;
  return {
    bookName: bookName.trim(),
    chapter: parseInt(ch),
    startVerse: parseInt(sv),
    endVerse: ev ? parseInt(ev) : parseInt(sv),
  };
}

function resolveBook(name: string) {
  const n = name.toLowerCase();
  return BIBLE_BOOKS.find(
    b =>
      b.name.toLowerCase() === n ||
      b.name.toLowerCase() === n + "s" ||  // Psalm → Psalms
      (n.endsWith("s") && b.name.toLowerCase() === n.slice(0, -1))
  );
}

/** Fetch the AYT (Indonesian) verse text for a given English reference string. */
export async function fetchAytVerse(reference: string): Promise<string | null> {
  const parsed = parseRef(reference);
  if (!parsed) return null;

  const book = resolveBook(parsed.bookName);
  if (!book) return null;

  const bookId = USFM_BOOK_IDS[book.number - 1];
  if (!bookId) return null;

  try {
    const resp = await fetch(
      `https://bible.helloao.org/api/ind_ayt/${bookId}/${parsed.chapter}.json`,
      { next: { revalidate: 86400 } }
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const content: AytChapterItem[] = data?.chapter?.content ?? [];

    const text = content
      .filter(
        item =>
          item.type === "verse" &&
          item.number !== undefined &&
          item.number >= parsed.startVerse &&
          item.number <= parsed.endVerse
      )
      .map(item => extractAytText(item.content ?? []))
      .join(" ");

    return text || null;
  } catch {
    return null;
  }
}

/** Convert an English verse reference to use Indonesian book name. */
export function localizeVerseReference(reference: string): string {
  const parsed = parseRef(reference);
  if (!parsed) return reference;
  const book = resolveBook(parsed.bookName);
  if (!book) return reference;
  const rest = reference.slice(parsed.bookName.length);
  return book.name_id + rest;
}
