export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  description?: string;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: "de4e12af7f28f599-02", name: "King James Version", abbreviation: "KJV", language: "English", description: "The classic 1611 translation" },
  { id: "06125adad2d5898a-01", name: "American Standard Version", abbreviation: "ASV", language: "English", description: "Accurate 1901 American translation" },
  { id: "9879dbb7cfe39e4d-04", name: "World English Bible", abbreviation: "WEB", language: "English", description: "Modern public domain translation" },
];

export const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Sunshine", hex: "#FEF08A", dark: "#CA8A04" },
  { id: "green", label: "Growth", hex: "#86EFAC", dark: "#16A34A" },
  { id: "blue", label: "Peace", hex: "#93C5FD", dark: "#2563EB" },
  { id: "pink", label: "Love", hex: "#F9A8D4", dark: "#DB2777" },
  { id: "purple", label: "Wisdom", hex: "#C4B5FD", dark: "#7C3AED" },
  { id: "orange", label: "Joy", hex: "#FED7AA", dark: "#EA580C" },
] as const;

export type HighlightColor = typeof HIGHLIGHT_COLORS[number]["id"];

export interface BibleReaderSettings {
  fontSize: number;
  fontFamily: "serif" | "sans" | "mono";
  theme: "light" | "dark" | "sepia";
  lineSpacing: "compact" | "normal" | "relaxed" | "loose";
  showVerseNumbers: boolean;
  showChapterNumbers: boolean;
  translation: string;
}

export interface JournalMood {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const JOURNAL_MOODS: JournalMood[] = [
  { id: "joyful", label: "Joyful", emoji: "😊", color: "#FEF08A" },
  { id: "peaceful", label: "Peaceful", emoji: "😌", color: "#86EFAC" },
  { id: "hopeful", label: "Hopeful", emoji: "🌅", color: "#93C5FD" },
  { id: "grateful", label: "Grateful", emoji: "🙏", color: "#C4B5FD" },
  { id: "struggling", label: "Struggling", emoji: "😔", color: "#FCA5A5" },
  { id: "confused", label: "Confused", emoji: "😕", color: "#FED7AA" },
  { id: "anxious", label: "Anxious", emoji: "😟", color: "#F9A8D4" },
  { id: "sad", label: "Sad", emoji: "😢", color: "#BAE6FD" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#E5E7EB" },
];

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  isPremium?: boolean;
}

export interface SearchResult {
  type: "verse" | "devotional" | "plan" | "note";
  id: string;
  title: string;
  excerpt: string;
  reference?: string;
  url: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AIProvider {
  name: string;
  chat(messages: AIMessage[], options?: AIOptions): Promise<string>;
  stream(messages: AIMessage[], options?: AIOptions): AsyncIterable<string>;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export type Theme = "light" | "dark" | "system" | "sepia";

export interface StreakData {
  current: number;
  longest: number;
  lastActive: string | null;
  daysThisWeek: number[];
}

export interface PlanDay {
  day: number;
  title: string;
  readings: PlanReading[];
  completed?: boolean;
}

export interface PlanReading {
  book: string;
  chapters: number[];
  verses?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  reference: string;
  url: string;
  duration: number;
  reader?: string;
}
