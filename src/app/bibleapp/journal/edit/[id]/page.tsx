import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalEditor } from "@/components/journal/JournalEditor";
import type { JournalEntry } from "@/types/database";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Journal Entry" };

export default async function EditJournalEntryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const { data: raw } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const entry = raw as JournalEntry | null;
  if (!entry) notFound();

  return (
    <JournalEditor
      initialEntry={{
        id: entry.id,
        title: entry.title,
        content: entry.content,
        content_html: entry.content_html,
        type: entry.type,
        mood: entry.mood,
        tags: entry.tags,
        is_private: entry.is_private,
        is_favorite: entry.is_favorite,
      }}
    />
  );
}
