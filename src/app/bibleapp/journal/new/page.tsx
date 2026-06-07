import { JournalEditor } from "@/components/journal/JournalEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Journal Entry" };

export default function NewJournalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <JournalEditor />
    </div>
  );
}
