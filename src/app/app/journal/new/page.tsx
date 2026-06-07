"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const TYPES = [
  { value: "reflection", label: "Reflection" },
  { value: "prayer",     label: "Prayer" },
  { value: "gratitude",  label: "Gratitude" },
  { value: "study",      label: "Study" },
  { value: "general",    label: "General" },
];

const TYPE_COLOR: Record<string, string> = {
  reflection: "#2563A8",
  prayer: "#9D174D",
  gratitude: "#276749",
  study: "#B45309",
  general: "#4B5563",
};

export default function NewJournalPage() {
  const router = useRouter();
  type EntryType = "reflection" | "prayer" | "gratitude" | "sermon_notes" | "study" | "general";
  const [type, setType] = useState<EntryType>("reflection");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Write something first");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/app/login"); return; }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      type,
      title: title.trim() || null,
      content: content.trim(),
      is_private: true,
    });

    if (error) {
      toast.error("Failed to save entry");
      setLoading(false);
      return;
    }
    toast.success("Entry saved");
    router.push("/app/journal");
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-black flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/app/journal" className="text-[#888] cursor-pointer">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          onClick={handleSave}
          disabled={loading || !content.trim()}
          className="text-[15px] font-semibold text-[#111] dark:text-white disabled:text-[#AAA] cursor-pointer transition-colors"
        >
          {loading ? "Saving…" : "Save"}
        </button>
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

      {/* Date */}
      <div className="px-5 pb-4">
        <p className="text-[12px] text-[#888]">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8">
        <div className="h-px bg-[#F0F0F0] dark:bg-[#222] mb-4" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, reflections, or prayers…"
          className="w-full h-full min-h-[300px] bg-transparent outline-none text-[16px] leading-[1.75] placeholder:text-[#CCC] dark:placeholder:text-[#444] resize-none"
          autoFocus
        />
      </div>

    </div>
  );
}
