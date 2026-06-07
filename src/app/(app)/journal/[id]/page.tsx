import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatWordCount } from "@/lib/utils/format";
import { JOURNAL_MOODS } from "@/types/app";
import type { JournalEntry } from "@/types/database";
import type { Metadata } from "next";
import JournalEntryActions from "@/components/journal/JournalEntryActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  reflection: "Reflection",
  prayer: "Prayer",
  gratitude: "Gratitude",
  sermon_notes: "Sermon Notes",
  study: "Bible Study",
  general: "General",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("journal_entries").select("title, content").eq("id", id).single();
  const entry = data as Pick<JournalEntry, "title" | "content"> | null;
  return {
    title: entry?.title ?? "Journal Entry",
  };
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const entry = raw as JournalEntry | null;
  if (!entry) notFound();

  const mood = JOURNAL_MOODS.find(m => m.id === entry.mood);
  const paragraphs = entry.content.split("\n\n").filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/journal">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Journal
          </Link>
        </Button>
        <JournalEntryActions entryId={entry.id} isFavorite={entry.is_favorite} />
      </div>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline">{TYPE_LABELS[entry.type] ?? entry.type}</Badge>
            <span className="text-sm text-muted-foreground">{formatDate(entry.created_at)}</span>
            <span className="text-xs text-muted-foreground">{formatWordCount(entry.word_count)}</span>
            {entry.is_favorite && (
              <Badge variant="gold" className="text-[10px]">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Favorite
              </Badge>
            )}
            {entry.is_private && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Private
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold font-serif mb-3">
            {entry.title ?? "Untitled Entry"}
          </h1>

          {mood && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg w-fit">
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.label}</span>
            </div>
          )}

          {entry.verse_references.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.verse_references.map((ref) => (
                <Link
                  key={ref}
                  href={`/bible?passage=${encodeURIComponent(ref)}`}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  📖 {ref}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="prose dark:prose-invert max-w-none font-serif text-base leading-relaxed">
          {entry.content_html ? (
            <div dangerouslySetInnerHTML={{ __html: entry.content_html }} />
          ) : (
            paragraphs.map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))
          )}
        </div>

        {entry.tags.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
