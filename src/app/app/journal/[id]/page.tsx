import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import type { JournalEntry } from "@/types/database";

const TYPE_LABEL: Record<string, string> = {
  reflection: "Reflection", prayer: "Prayer", gratitude: "Gratitude",
  sermon_notes: "Sermon", study: "Study", general: "General",
};

const TYPE_COLOR: Record<string, string> = {
  reflection: "#2563A8", prayer: "#9D174D", gratitude: "#276749",
  sermon_notes: "#5B4397", study: "#B45309", general: "#4B5563",
};

interface Props { params: Promise<{ id: string }> }

export default async function JournalEntryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) notFound();
  const entry = data as JournalEntry;
  const color = TYPE_COLOR[entry.type] ?? TYPE_COLOR.general;

  return (
    <div className="min-h-full bg-white dark:bg-black">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/app/journal" className="text-[#888] cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Link href={`/app/journal/${entry.id}/edit`} className="text-[#888] cursor-pointer p-1">
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      {/* Type badge */}
      <div className="px-5 pb-2">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full"
          style={{ backgroundColor: color + "18", color }}
        >
          {TYPE_LABEL[entry.type] ?? "Entry"}
        </span>
      </div>

      {/* Title */}
      {entry.title && (
        <div className="px-5 pt-3 pb-1">
          <h1 className="text-[24px] font-bold tracking-tight">{entry.title}</h1>
        </div>
      )}

      {/* Date */}
      <div className="px-5 pb-4 pt-1">
        <p className="text-[12px] text-[#888]">
          {new Date(entry.created_at).toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          })}
        </p>
      </div>

      <div className="h-px bg-[#F0F0F0] dark:bg-[#222] mx-5 mb-5" />

      {/* Content */}
      <div className="px-5 pb-16">
        <p className="text-[16px] leading-[1.8] whitespace-pre-wrap">{entry.content}</p>
      </div>

    </div>
  );
}
