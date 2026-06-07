import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, NotebookPen } from "lucide-react";
import type { JournalEntry } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal" };

const TYPE_LABEL: Record<string, string> = {
  reflection: "Reflection", prayer: "Prayer", gratitude: "Gratitude",
  sermon_notes: "Sermon", study: "Study", general: "General",
};

const TYPE_COLOR: Record<string, string> = {
  reflection: "#2563A8",
  prayer: "#9D174D",
  gratitude: "#276749",
  sermon_notes: "#5B4397",
  study: "#B45309",
  general: "#4B5563",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const entries = (data ?? []) as JournalEntry[];

  type Group = { label: string; entries: JournalEntry[] };
  const grouped: Group[] = [];
  for (const entry of entries) {
    const label = formatDate(entry.created_at);
    const last = grouped[grouped.length - 1];
    if (last?.label === label) last.entries.push(entry);
    else grouped.push({ label, entries: [entry] });
  }

  return (
    <div className="min-h-full bg-white dark:bg-black">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <h1 className="text-[28px] font-bold tracking-tight">Journal</h1>
        <Link
          href="/app/journal/new"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#888] cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 mt-24">
          <NotebookPen className="h-10 w-10 text-[#CCC] mb-5" strokeWidth={1} />
          <h2 className="font-bold text-[19px] tracking-tight">Your journal is empty</h2>
          <p className="text-[14px] text-[#888] mt-2 mb-8 leading-relaxed">Capture thoughts, prayers, and reflections.</p>
          <Link
            href="/app/journal/new"
            className="bg-[#111] dark:bg-white text-white dark:text-black font-semibold rounded-2xl px-8 py-3.5 text-[15px] active:opacity-70 transition-opacity cursor-pointer"
          >
            Write first entry
          </Link>
        </div>
      ) : (
        <div className="pb-28">
          {grouped.map(({ label, entries: groupEntries }) => (
            <div key={label} className="border-t border-[#F0F0F0] dark:border-[#222]">
              {/* Date header */}
              <p className="text-[11px] font-semibold text-[#888] uppercase tracking-[0.12em] px-5 pt-4 pb-1">{label}</p>

              {groupEntries.map((entry) => {
                const color = TYPE_COLOR[entry.type] ?? TYPE_COLOR.general;
                return (
                  <Link
                    key={entry.id}
                    href={`/app/journal/${entry.id}`}
                    className="flex items-start gap-0 border-t border-[#F0F0F0] dark:border-[#222] first:border-t-0 active:bg-[#F5F5F5] dark:active:bg-[#111] transition-colors cursor-pointer"
                  >
                    {/* Color strip */}
                    <div className="w-[3px] self-stretch flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0 px-4 py-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold" style={{ color }}>
                          {TYPE_LABEL[entry.type] ?? "Entry"}
                        </span>
                        <span className="text-[11px] text-[#888] flex-shrink-0">
                          {new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                      {entry.title && (
                        <p className="font-semibold text-[15px] mb-0.5 truncate">{entry.title}</p>
                      )}
                      <p className="text-[13px] text-[#888] line-clamp-2 leading-relaxed">{entry.content}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/app/journal/new"
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-5 h-14 w-14 bg-[#111] dark:bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform z-40 cursor-pointer"
        aria-label="New journal entry"
      >
        <Plus className="h-6 w-6 text-white dark:text-black" />
      </Link>

    </div>
  );
}
