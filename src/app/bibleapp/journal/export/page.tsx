import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils/format";
import { canAccess } from "@/lib/billing/features";
import type { JournalEntry } from "@/types/database";

export const metadata = { title: "Journal Export — Selah" };

const MOOD_EMOJIS: Record<string, string> = {
  grateful: "🙏",
  peaceful: "☮️",
  joyful: "😊",
  reflective: "🤔",
  struggling: "😔",
  hopeful: "🌟",
  uncertain: "😕",
  convicted: "⚡",
};

export default async function JournalExportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/bibleapp/login");

  const canExport = await canAccess("journal_pdf_export");
  if (!canExport) redirect("/bibleapp/upgrade");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name")
    .eq("id", user.id)
    .single();

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const name = profile?.display_name ?? profile?.full_name ?? "My Journal";
  const exportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <html>
      <head>
        <title>{name} — Journal Export</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #fff; max-width: 720px; margin: 0 auto; padding: 48px 40px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            .entry { page-break-inside: avoid; }
          }
          .header { border-bottom: 2px solid #b45309; padding-bottom: 24px; margin-bottom: 32px; }
          .header h1 { font-size: 28px; color: #b45309; margin-bottom: 4px; }
          .header p { font-size: 13px; color: #666; }
          .entry { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
          .entry:last-child { border-bottom: none; }
          .entry-meta { display: flex; gap: 12px; align-items: baseline; margin-bottom: 10px; flex-wrap: wrap; }
          .entry-date { font-size: 11px; color: #666; font-style: italic; }
          .entry-type { font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-family: sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .entry-mood { font-size: 13px; }
          .entry-ref { font-size: 11px; color: #059669; font-style: italic; }
          .entry-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; line-height: 1.4; }
          .entry-content { font-size: 14px; line-height: 1.8; color: #374151; }
          .entry-content p { margin-bottom: 8px; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #b45309; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; cursor: pointer; font-family: sans-serif; }
          .print-btn:hover { background: #92400e; }
          .empty { text-align: center; padding: 48px 0; color: #666; font-style: italic; }
          .count { font-size: 12px; color: #888; margin-bottom: 32px; font-family: sans-serif; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>{name} — Faith Journal</h1>
          <p>Exported on {exportDate} · {entries?.length ?? 0} entries</p>
        </div>

        <p className="count">{entries?.length ?? 0} journal entries</p>

        {!entries || entries.length === 0 ? (
          <p className="empty">No journal entries yet.</p>
        ) : (
          entries.map((entry: JournalEntry) => (
            <div key={entry.id} className="entry">
              <div className="entry-meta">
                <span className="entry-date">{formatDate(entry.created_at)}</span>
                <span className="entry-type">{entry.type}</span>
                {entry.mood && <span className="entry-mood">{MOOD_EMOJIS[entry.mood] ?? ""} {entry.mood}</span>}
                {entry.verse_references?.length > 0 && (
                  <span className="entry-ref">📖 {entry.verse_references.join(", ")}</span>
                )}
              </div>
              {entry.title && <h2 className="entry-title">{entry.title}</h2>}
              <div
                className="entry-content"
                dangerouslySetInnerHTML={{ __html: entry.content_html ?? entry.content ?? "" }}
              />
            </div>
          ))
        )}

        <button className="print-btn no-print" onClick={() => window.print()}>
          🖨️ Print / Save as PDF
        </button>

        <script dangerouslySetInnerHTML={{ __html: `
          if (new URLSearchParams(location.search).get('print') === '1') {
            window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 600); });
          }
        `}} />
      </body>
    </html>
  );
}
