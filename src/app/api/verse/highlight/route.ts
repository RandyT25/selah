import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

interface VersePayload {
  book_id: string;
  chapter_id: string;
  verse_number: number;
  text: string;
  reference: string;
}

async function ensureVerse(admin: Awaited<ReturnType<typeof createAdminClient>>, verseId: string, verse: VersePayload) {
  await admin.from("bible_verses").upsert({
    id: verseId,
    book_id: verse.book_id || "unknown",
    chapter_id: verse.chapter_id || "unknown",
    verse_number: verse.verse_number,
    text: verse.text,
    reference: verse.reference,
    translation: "KJV",
    api_id: null,
    cached_at: new Date().toISOString(),
  }, { onConflict: "id" });
}

// Upsert highlight
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verseId, color, verse } = await req.json();
  if (!verseId || !color) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = await createAdminClient();

  // Satisfy FK constraint: ensure verse exists in bible_verses
  if (verse) await ensureVerse(admin, verseId, verse);

  await admin.from("verse_highlights").delete().eq("user_id", user.id).eq("verse_id", verseId);
  const { error } = await admin.from("verse_highlights").insert({ user_id: user.id, verse_id: verseId, color });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Remove highlight
export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verseId } = await req.json();
  if (!verseId) return NextResponse.json({ error: "Missing verseId" }, { status: 400 });

  const admin = await createAdminClient();
  const { error } = await admin.from("verse_highlights").delete().eq("user_id", user.id).eq("verse_id", verseId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
