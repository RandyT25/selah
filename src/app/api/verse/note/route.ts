import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Upsert note
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { verseId, content } = await req.json();
  if (!verseId || !content?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = await createAdminClient();
  await admin.from("verse_notes").delete().eq("user_id", user.id).eq("verse_id", verseId);
  const { error } = await admin.from("verse_notes").insert({ user_id: user.id, verse_id: verseId, content: content.trim(), is_private: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
