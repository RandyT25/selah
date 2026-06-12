/**
 * Generates a complete 365-day sequential Bible reading plan and saves it to Supabase.
 * Covers all 1189 chapters (66 books), ~3–4 chapters per day.
 *
 * Run: node --env-file=.env.local scripts/seed-bible-plan.mjs
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing env vars. Run with:\n  node --env-file=.env.local scripts/seed-bible-plan.mjs"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const BOOKS = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

// Build flat list of every chapter in canonical order
const allChapters = [];
for (const book of BOOKS) {
  for (let ch = 1; ch <= book.chapters; ch++) {
    allChapters.push({ book: book.name, chapter: ch });
  }
}
// Should be 1189
const TOTAL_DAYS = 365;
const base = Math.floor(allChapters.length / TOTAL_DAYS); // 3
const extra = allChapters.length % TOTAL_DAYS;            // 94 days get 4 chapters

// Evenly space the 4-chapter days across the year (Bresenham-style)
const fourChapterDays = new Set();
for (let i = 0; i < extra; i++) {
  fourChapterDays.add(Math.round((i + 0.5) * TOTAL_DAYS / extra));
}

const schedule = [];
let idx = 0;

for (let day = 1; day <= TOTAL_DAYS; day++) {
  const count = base + (fourChapterDays.has(day) ? 1 : 0);
  const dayChapters = allChapters.slice(idx, idx + count);
  idx += count;

  const passages = dayChapters.map((c) => `${c.book} ${c.chapter}`);
  const booksToday = [...new Set(dayChapters.map((c) => c.book))];

  let title;
  if (booksToday.length === 1) {
    const nums = dayChapters.map((c) => c.chapter);
    title =
      nums.length === 1
        ? `${booksToday[0]} ${nums[0]}`
        : `${booksToday[0]} ${nums[0]}–${nums[nums.length - 1]}`;
  } else {
    title = booksToday.join(" & ");
  }

  schedule.push({ day, title, passages });
}

if (idx !== allChapters.length) {
  console.error(`Chapter count mismatch: assigned ${idx}, expected ${allChapters.length}`);
  process.exit(1);
}

console.log(`Generated ${schedule.length} days covering ${allChapters.length} chapters`);
console.log(`  Day 1  : ${schedule[0].title} — ${schedule[0].passages.join(", ")}`);
console.log(`  Day 365: ${schedule[364].title} — ${schedule[364].passages.join(", ")}`);

const { error } = await supabase
  .from("reading_plans")
  .update({ duration_days: 365, content: schedule })
  .eq("title", "Bible in a Year");

if (error) {
  console.error("Supabase error:", error.message);
  process.exit(1);
}

console.log("✓ Bible in a Year updated — 365 days, all 1189 chapters scheduled!");
