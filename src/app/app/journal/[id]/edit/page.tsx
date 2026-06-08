"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { JournalEntry } from "@/types/database";

const TYPES = [
  { value: "reflection", label: "Reflection" },
  { value: "prayer",     label: "Prayer" },
  { value: "gratitude",  label: "Gratitude" },
  { value: "study",      label: "Study" },
  { value: "general",    label: "General" },
];

const TYPE_COLOR: Record<string, string> = {
  reflection: "#2563A8", prayer: "#9D174D", gratitude: "#276749",
  study: "#B45309", general: "#4B5563",
};

export default function EditJournalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  type EntryType = "reflection" | "prayer" | "gratitude" | "sermon_notes" | "study" | "general";
  const [type, setType] = useState<EntryType>("reflection");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/app/login"); return; }
      const { data } = await supabase
        .from("journal_entries").select("*").eq("id", id).eq("user_id", user.id).single();
      if (!data) { router.push("/app/journal"); return; }
      const entry = data as JournalEntry;
      setType(entry.type as EntryType);
      setTitle(entry.title ?? "");
      setContent(entry.content);
      setReady(true);
    };
    load();
  }, [id, router]);

  const handleSave = async () => {
    if (!content.trim()) { toast.error("Write something first"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("journal_entries")
      .update({ type, title: title.trim() || null, content: content.trim() })
      .eq("id", id);
    if (error) { toast.error("Failed to save"); setLoading(false); return; }
    toast.success("Saved");
    router.push(`/app/journal/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); setDeleting(false); return; }
    toast.success("Entry deleted");
    router.push("/app/journal");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E0E0E0] border-t-[#111] dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href={`/app/journal/${id}`} className="text-[#888] cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[#FF3B30] cursor-pointer disabled:opacity-40"
            aria-label="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !content.trim()}
            className="text-[15px] font-semibold text-[#111] dark:text-white disabled:text-[#AAA] cursor-pointer transition-colors"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Type picker */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value as EntryType)}
            className="flex-shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all cursor-pointer"
            style={type === t.value
              ? { backgroundColor: TYPE_COLOR[t.value], color: "white" }
              : { border: "1px solid #E0E0E0", color: "#888", backgroundColor: "transparent" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="px-5 pb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full text-[22px] font-bold bg-transparent outline-none placeholder:text-[#CCC] dark:placeholder:text-[#444]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8">
        <div className="h-px bg-[#F0F0F0] dark:bg-[#222] mb-4" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts…"
          className="w-full h-full min-h-[300px] bg-transparent outline-none text-[16px] leading-[1.75] placeholder:text-[#CCC] dark:placeholder:text-[#444] resize-none"
          autoFocus
        />
      </div>
    </div>
  );
}
