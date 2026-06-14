import { NextResponse } from "next/server";
import { FCBH_BASE, SLUG_TO_OSIS, getFileset } from "@/lib/bible/fcbh";

export const revalidate = 86400; // cache 24h

export async function GET(
  _: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  const { book, chapter } = await params;
  const apiKey = process.env.FCBH_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "no_key" }, { status: 404 });
  }

  const osisCode = SLUG_TO_OSIS[book];
  if (!osisCode) {
    return NextResponse.json({ error: "unknown_book" }, { status: 404 });
  }

  const chapterNum = parseInt(chapter, 10);
  const fileset = getFileset(osisCode);

  const audioRes = await fetch(
    `${FCBH_BASE}/bibles/filesets/${fileset}/${osisCode}/${chapterNum}?v=4&key=${apiKey}`,
    { next: { revalidate: 86400 } }
  );

  if (!audioRes.ok) {
    return NextResponse.json({ error: "fcbh_error" }, { status: 502 });
  }

  const audioData = await audioRes.json();
  const file = audioData.data?.[0];

  if (!file?.path) {
    return NextResponse.json({ error: "no_audio" }, { status: 404 });
  }

  // Verse timestamps enable karaoke highlighting
  let timestamps: { verse_start: number; timestamp: number }[] = [];
  try {
    const tsRes = await fetch(
      `${FCBH_BASE}/timestamps/${fileset}/${osisCode}/${chapterNum}?v=4&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    if (tsRes.ok) {
      const tsData = await tsRes.json();
      timestamps = tsData.data ?? [];
    }
  } catch {
    // timestamps are optional — playback still works without them
  }

  return NextResponse.json({
    url: file.path,
    duration: file.duration ?? 0,
    timestamps,
    fileset,
  });
}
