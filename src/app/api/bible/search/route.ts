import { NextResponse } from "next/server";

// Topic → key verse references (book+chapter+verse for bible-api.com)
const TOPIC_VERSES: Record<string, string[]> = {
  love: ["1 john 4:7","1 john 4:8","john 3:16","romans 8:38","1 corinthians 13:4","romans 5:8","john 15:13","1 john 3:16","jeremiah 31:3","song of solomon 8:7"],
  hope: ["romans 15:13","jeremiah 29:11","romans 8:24","hebrews 11:1","psalm 62:5","lamentations 3:25","romans 5:5","1 peter 1:3","romans 8:28","psalm 33:18"],
  faith: ["hebrews 11:1","mark 11:22","hebrews 11:6","james 2:17","ephesians 2:8","romans 10:17","matthew 17:20","2 corinthians 5:7","galatians 2:20","1 peter 1:7"],
  peace: ["john 14:27","philippians 4:7","isaiah 26:3","romans 5:1","john 16:33","colossians 3:15","numbers 6:26","psalm 29:11","matthew 5:9","isaiah 9:6"],
  anxiety: ["philippians 4:6","1 peter 5:7","matthew 6:34","psalm 94:19","isaiah 41:10","psalm 55:22","luke 12:22","matthew 11:28","2 timothy 1:7","psalm 34:4"],
  strength: ["philippians 4:13","isaiah 40:31","psalm 28:7","2 corinthians 12:9","ephesians 6:10","joshua 1:9","psalm 46:1","isaiah 12:2","1 chronicles 16:11","habakkuk 3:19"],
  healing: ["psalm 147:3","isaiah 53:5","jeremiah 17:14","james 5:14","matthew 4:23","exodus 15:26","psalm 41:3","3 john 1:2","luke 4:18","acts 10:38"],
  grace: ["ephesians 2:8","2 corinthians 12:9","romans 6:14","hebrews 4:16","titus 2:11","john 1:14","james 4:6","1 peter 5:10","2 peter 3:18","romans 5:2"],
  forgiveness: ["ephesians 4:32","colossians 1:14","1 john 1:9","matthew 6:14","psalm 103:12","micah 7:18","acts 13:38","luke 6:37","romans 8:1","matthew 26:28"],
  prayer: ["philippians 4:6","matthew 6:9","1 thessalonians 5:17","james 5:16","jeremiah 29:12","mark 11:24","john 16:24","psalm 145:18","1 john 5:14","luke 18:1"],
  salvation: ["john 3:16","romans 10:9","ephesians 2:8","acts 4:12","john 14:6","romans 6:23","titus 3:5","1 timothy 2:4","acts 16:31","john 3:17"],
  wisdom: ["proverbs 3:5","james 1:5","proverbs 1:7","proverbs 9:10","psalm 111:10","ecclesiastes 2:26","james 3:17","colossians 2:3","1 corinthians 1:30","daniel 2:21"],
  fear: ["isaiah 41:10","2 timothy 1:7","psalm 34:4","joshua 1:9","deuteronomy 31:6","psalm 27:1","matthew 10:28","proverbs 29:25","1 john 4:18","luke 12:32"],
  joy: ["psalm 16:11","nehemiah 8:10","john 15:11","philippians 4:4","psalm 30:5","john 16:22","romans 15:13","galatians 5:22","isaiah 61:10","1 peter 1:8"],
  truth: ["john 8:32","john 14:6","john 17:17","psalm 119:160","proverbs 12:17","ephesians 4:15","3 john 1:4","2 timothy 3:16","psalm 25:5","1 john 1:6"],
  family: ["proverbs 22:6","ephesians 6:1","colossians 3:20","proverbs 11:29","deuteronomy 6:6","joshua 24:15","psalm 127:3","genesis 2:24","1 timothy 5:8","proverbs 17:6"],
  marriage: ["genesis 2:24","ephesians 5:25","hebrews 13:4","proverbs 18:22","1 corinthians 7:3","mark 10:9","malachi 2:16","proverbs 31:10","colossians 3:18","1 peter 3:7"],
  grief: ["psalm 34:18","matthew 5:4","revelation 21:4","john 11:35","psalm 147:3","2 corinthians 1:3","psalm 30:5","isaiah 61:3","romans 8:28","john 16:20"],
  trust: ["proverbs 3:5","psalm 56:3","isaiah 26:4","psalm 37:5","jeremiah 17:7","psalm 91:2","nahum 1:7","psalm 125:1","2 samuel 22:3","psalm 62:8"],
  purpose: ["jeremiah 29:11","romans 8:28","proverbs 16:9","psalm 138:8","ephesians 2:10","philippians 1:6","psalm 57:2","proverbs 19:21","isaiah 46:10","acts 17:28"],
};

interface BibleApiVerse { verse: number; text: string }
interface BibleApiResponse { verses?: BibleApiVerse[]; reference?: string }

async function fetchVerse(ref: string): Promise<{ reference: string; text: string } | null> {
  try {
    const encoded = encodeURIComponent(ref);
    const res = await fetch(`https://bible-api.com/${encoded}?translation=kjv`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data: BibleApiResponse = await res.json();
    const verse = data.verses?.[0];
    if (!verse) return null;
    return { reference: data.reference ?? ref, text: verse.text.trim() };
  } catch {
    return null;
  }
}

function parseBookChapter(q: string): { book: string; chapter: number } | null {
  // Match patterns like "John 3" or "1 John 4"
  const match = q.match(/^(\d?\s?[a-zA-Z]+(?:\s[a-zA-Z]+)?)\s+(\d+)$/i);
  if (!match) return null;
  return { book: match[1].trim(), chapter: parseInt(match[2]) };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Find matching topics
  const matchedTopics = Object.entries(TOPIC_VERSES).filter(
    ([topic]) => topic.includes(query) || query.includes(topic)
  );

  // Try exact topic match first, then partial
  const refs = matchedTopics.length > 0
    ? matchedTopics.flatMap(([, verses]) => verses).slice(0, 10)
    : Object.entries(TOPIC_VERSES)
        .filter(([topic]) => topic.startsWith(query[0]))
        .flatMap(([, verses]) => verses)
        .slice(0, 5);

  if (refs.length === 0) {
    // Try as a direct reference (e.g. "John 3:16")
    const direct = await fetchVerse(query);
    if (direct) {
      return NextResponse.json({
        results: [{ id: query, book: direct.reference, chapter: 1, verse: 1, text: direct.text }],
      });
    }
    return NextResponse.json({ results: [] });
  }

  // Fetch verses in parallel (cap at 10)
  const settled = await Promise.allSettled(refs.slice(0, 10).map(fetchVerse));
  const results = settled
    .filter((r): r is PromiseFulfilledResult<{ reference: string; text: string }> =>
      r.status === "fulfilled" && r.value !== null)
    .map((r, i) => {
      const parts = r.value.reference.split(" ");
      return {
        id: `search-${i}`,
        book: r.value.reference,
        chapter: 1,
        verse: 1,
        text: r.value.text,
      };
    });

  return NextResponse.json({ results });
}
