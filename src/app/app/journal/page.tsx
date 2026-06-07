import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotebookPen, Plus, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JournalEntry } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal" };

const typeLabel: Record<string, string> = {
  reflection: "Reflection", prayer: "Prayer", gratitude: "Gratitude",
  sermon_notes: "Sermon", study: "Study", general: "General",
};
const typeBg: Record<string, string> = {
  reflection: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  prayer: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  gratitude: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  sermon_notes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  study: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  general: "bg-muted text-muted-foreground",
};

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

  return (
    <div className="min-h-full pb-6">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-2xl border-b border-border/30 px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-bold">Journal</h1>
        <Link
          href="/app/journal/new"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-2xl px-4 py-2 active:opacity-80 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      <div className="px-4 mt-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center text-center mt-16">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
              <NotebookPen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-bold text-lg">Your journal is empty</h2>
            <p className="text-muted-foreground text-sm mt-1 mb-6">Start writing to capture your thoughts</p>
            <Link
              href="/app/journal/new"
              className="bg-primary text-primary-foreground font-semibold rounded-2xl px-6 py-3 active:opacity-80 transition-opacity"
            >
              Write your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/app/journal/${entry.id}`}
                className="block bg-card border border-border rounded-3xl p-4 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBg[entry.type] ?? typeBg.general}`}>
                    {typeLabel[entry.type] ?? "Entry"}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {entry.title && (
                  <h3 className="font-semibold text-[15px] mb-1 line-clamp-1">{entry.title}</h3>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{entry.content}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/app/journal/new"
        className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] right-4 h-14 w-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </Link>
    </div>
  );
}
