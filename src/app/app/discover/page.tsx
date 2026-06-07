import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, BookOpen, LayoutList, NotebookPen, HandHeart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discover" };

const TOPICS = [
  { label: "Love",        bg: "#C2185B", text: "#fff" },
  { label: "Anxiety",     bg: "#1565C0", text: "#fff" },
  { label: "Hope",        bg: "#E65100", text: "#fff" },
  { label: "Peace",       bg: "#2E7D32", text: "#fff" },
  { label: "Depression",  bg: "#4A148C", text: "#fff" },
  { label: "Anger",       bg: "#B71C1C", text: "#fff" },
  { label: "Faith",       bg: "#0D47A1", text: "#fff" },
  { label: "Grief",       bg: "#37474F", text: "#fff" },
  { label: "Joy",         bg: "#F57F17", text: "#fff" },
  { label: "Fear",        bg: "#4E342E", text: "#fff" },
  { label: "Forgiveness", bg: "#00695C", text: "#fff" },
  { label: "Strength",    bg: "#558B2F", text: "#fff" },
  { label: "Grace",       bg: "#6A1B9A", text: "#fff" },
  { label: "Healing",     bg: "#00838F", text: "#fff" },
  { label: "Wisdom",      bg: "#1A237E", text: "#fff" },
  { label: "Prayer",      bg: "#880E4F", text: "#fff" },
];

const CATEGORIES = [
  { label: "Plans",      href: "/app/plans",   icon: LayoutList,  bg: "#111 dark:bg-[#1A1A1A]" },
  { label: "Bible",      href: "/app/bible",   icon: BookOpen,    bg: "#111" },
  { label: "Journal",    href: "/app/journal", icon: NotebookPen, bg: "#111" },
  { label: "Prayer",     href: "/app/prayer",  icon: HandHeart,   bg: "#111" },
];

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  return (
    <div className="min-h-full bg-white dark:bg-black pb-8">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight">Discover</h1>
      </div>

      {/* ── Search bar ── */}
      <div className="px-5 mb-6">
        <Link
          href="/app/search"
          className="flex items-center gap-3 h-[46px] rounded-2xl bg-[#F5F5F5] dark:bg-[#1A1A1A] px-4 cursor-pointer"
        >
          <Search className="h-4 w-4 text-[#888] flex-shrink-0" strokeWidth={1.5} />
          <span className="text-[15px] text-[#888]">Search verses, topics…</span>
        </Link>
      </div>

      {/* ── Categories ── */}
      <div className="px-5 mb-7">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Browse</p>
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#1A1A1A] active:opacity-70 transition-opacity cursor-pointer"
            >
              <Icon className="h-5 w-5 text-[#111] dark:text-white" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold text-[#111] dark:text-white">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Topic grid ── */}
      <div className="px-5">
        <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] mb-3">Topics</p>
        <div className="grid grid-cols-2 gap-2.5">
          {TOPICS.map(({ label, bg, text }) => (
            <Link
              key={label}
              href={`/app/search?q=${encodeURIComponent(label.toLowerCase())}`}
              className="relative flex items-end rounded-2xl overflow-hidden h-[90px] active:opacity-85 transition-opacity cursor-pointer"
              style={{ backgroundColor: bg }}
            >
              {/* Inner gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <p
                className="relative z-10 px-4 pb-3 text-[16px] font-bold leading-tight"
                style={{ color: text }}
              >
                {label}
              </p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
