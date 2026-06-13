import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const JOURNAL_TYPES = ["reflection", "prayer", "gratitude", "sermon_notes", "study", "general"] as const;
const MOODS = ["joyful", "peaceful", "hopeful", "grateful", "struggling", "confused", "anxious", "sad", "neutral"] as const;

const CreateSchema = z.object({
  title:            z.string().max(200).optional().nullable(),
  content:          z.string().min(1, "Content is required").max(50_000),
  content_html:     z.string().max(200_000).optional().nullable(),
  type:             z.enum(JOURNAL_TYPES).default("reflection"),
  mood:             z.enum(MOODS).optional().nullable(),
  tags:             z.array(z.string().max(50)).max(10).default([]),
  verse_references: z.array(z.string().max(50)).max(20).default([]),
  is_private:       z.boolean().default(true),
  is_favorite:      z.boolean().default(false),
});

const UpdateSchema = z.object({
  id:               z.string().uuid("Invalid entry id"),
  title:            z.string().max(200).optional().nullable(),
  content:          z.string().min(1).max(50_000).optional(),
  content_html:     z.string().max(200_000).optional().nullable(),
  type:             z.enum(JOURNAL_TYPES).optional(),
  mood:             z.enum(MOODS).optional().nullable(),
  tags:             z.array(z.string().max(50)).max(10).optional(),
  verse_references: z.array(z.string().max(50)).max(20).optional(),
  is_private:       z.boolean().optional(),
  is_favorite:      z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = CreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("journal_entries")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[/api/journal POST]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = UpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, ...fields } = parsed.data;
    const admin = createAdminClient();
    const { error } = await admin
      .from("journal_entries")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/journal PATCH]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
