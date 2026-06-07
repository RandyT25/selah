import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return "Less than 1 min";
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}

export function formatWordCount(count: number): string {
  if (count === 0) return "No words";
  if (count === 1) return "1 word";
  return `${count.toLocaleString()} words`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function formatBibleReference(book: string, chapter: number, verse?: number, endVerse?: number): string {
  if (!verse) return `${book} ${chapter}`;
  if (!endVerse || endVerse === verse) return `${book} ${chapter}:${verse}`;
  return `${book} ${chapter}:${verse}-${endVerse}`;
}

export function parseBibleReference(ref: string): {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
} | null {
  const match = ref.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: match[3] ? parseInt(match[3]) : undefined,
    endVerse: match[4] ? parseInt(match[4]) : undefined,
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatStreakDays(count: number): string {
  if (count === 0) return "Start your streak!";
  if (count === 1) return "1 day streak";
  return `${count} day streak`;
}
