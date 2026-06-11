"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Highlighter,
  AlignLeft,
  AlignCenter,
  Heading2,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { JOURNAL_MOODS } from "@/types/app";
import Link from "next/link";

interface JournalEditorProps {
  initialEntry?: {
    id: string;
    title: string | null;
    content: string;
    content_html: string | null;
    type: string;
    mood: string | null;
    tags: string[];
    is_private: boolean;
    is_favorite: boolean;
  };
}

const ENTRY_TYPES = [
  { value: "reflection", label: "Reflection" },
  { value: "prayer", label: "Prayer" },
  { value: "gratitude", label: "Gratitude" },
  { value: "sermon_notes", label: "Sermon Notes" },
  { value: "study", label: "Bible Study" },
  { value: "general", label: "General" },
];

export function JournalEditor({ initialEntry }: JournalEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialEntry?.title ?? "");
  const [entryType, setEntryType] = useState(initialEntry?.type ?? "reflection");
  type MoodValue = "joyful" | "peaceful" | "hopeful" | "grateful" | "struggling" | "confused" | "anxious" | "sad" | "neutral";
  const [mood, setMood] = useState<MoodValue | "">(initialEntry?.mood as MoodValue | "" ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialEntry?.tags ?? []);
  const [isPrivate, setIsPrivate] = useState(initialEntry?.is_private ?? true);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Begin writing your reflection...\n\nWhat is God speaking to you today? What are you grateful for? What are you praying about?",
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
    ],
    content: initialEntry?.content_html ?? initialEntry?.content ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] font-serif text-base leading-relaxed",
      },
    },
  });

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, tags]);

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = async () => {
    const content = editor?.getText() ?? "";
    const contentHtml = editor?.getHTML() ?? "";
    if (!content.trim()) { toast.error("Please write something first"); return; }

    setSaving(true);
    try {
      const payload = {
        title: title || null,
        content,
        content_html: contentHtml,
        type: entryType,
        mood: mood || null,
        tags,
        is_private: isPrivate,
      };

      if (initialEntry?.id) {
        const res = await fetch("/api/journal", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initialEntry.id, ...payload }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Entry updated");
        router.push(`/bibleapp/journal/${initialEntry.id}`);
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        const { data } = await res.json();
        toast.success("Entry saved");
        router.push(`/bibleapp/journal/${data.id}`);
      }
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const ToolbarButton = ({ onClick, active, children, title }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-muted transition-colors",
        active && "bg-muted text-primary"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bibleapp/journal">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Journal
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsPrivate(!isPrivate)}>
            {isPrivate ? "🔒 Private" : "🌐 Public"}
          </Button>
          <Button variant="gold" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Entry Type</Label>
          <Select value={entryType} onValueChange={setEntryType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Mood</Label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {JOURNAL_MOODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(mood === m.id ? "" : m.id as MoodValue)}
                className={cn(
                  "text-lg transition-transform hover:scale-110",
                  mood === m.id ? "scale-125" : "opacity-60"
                )}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <Input
        placeholder="Entry title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      {/* Rich Text Toolbar */}
      {editor && (
        <div className="flex items-center gap-1 p-2 border rounded-lg bg-muted/30 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor */}
      <div className="min-h-[300px] border rounded-xl p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
        <EditorContent editor={editor} />
      </div>

      {/* Tags */}
      <div>
        <Label className="text-xs mb-2 block">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              #{tag} ×
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            className="max-w-[200px]"
          />
          <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
        </div>
      </div>
    </div>
  );
}
