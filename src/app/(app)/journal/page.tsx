import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { JournalEntry } from "@/types/database";
import { PenLine, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate, formatWordCount } from "@/lib/utils/format";
import { JOURNAL_MOODS } from "@/types/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Journal" };

const TYPE_LABELS: Record<string, string> = {
  reflection: "Reflection",
  prayer: "Prayer",
  gratitude: "Gratitude",
  sermon_notes: "Sermon Notes",
  study: "Bible Study",
  general: "General",
};

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rawEntries, count } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const entries = (rawEntries ?? []) as JournalEntry[];
  const totalWords = entries.reduce((sum, e) => sum + e.word_count, 0);
  const journalDays = new Set<string>(entries.map(e => e.created_at.split("T")[0])).size;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {count ?? 0} entries · {totalWords.toLocaleString()} words · {journalDays} days
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/journal/new">
            <Plus className="h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Entries", value: count ?? 0 },
          { label: "Words Written", value: totalWords.toLocaleString() },
          { label: "Days Journaled", value: journalDays },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry) => {
            const mood = JOURNAL_MOODS.find(m => m.id === entry.mood);
            return (
              <Link key={entry.id} href={`/journal/${entry.id}`}>
                <Card className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatDate(entry.created_at)}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {TYPE_LABELS[entry.type] ?? entry.type}
                          </Badge>
                          {entry.is_favorite && (
                            <Badge variant="gold" className="text-[10px]">★ Favorite</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {entry.title ?? "Untitled Entry"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {entry.content.replace(/<[^>]*>/g, "").slice(0, 160)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatWordCount(entry.word_count)}
                          </span>
                          {entry.tags.length > 0 && (
                            <div className="flex gap-1">
                              {entry.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {mood && (
                        <span className="text-2xl shrink-0" title={mood.label}>
                          {mood.emoji}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <PenLine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Start your journal</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Capture your reflections, prayers, and spiritual insights. Your journal is a sacred space.
            </p>
            <Button variant="gold" asChild>
              <Link href="/journal/new">
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Entry
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
