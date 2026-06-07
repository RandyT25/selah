import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const translation = searchParams.get("translation") ?? "KJV";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 3) {
    return NextResponse.json({ error: "Query must be at least 3 characters" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bible_verses")
    .select("*, bible_books(name, abbreviation), bible_chapters(chapter_number)")
    .eq("translation", translation)
    .textSearch("text", query, { type: "websearch" })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
