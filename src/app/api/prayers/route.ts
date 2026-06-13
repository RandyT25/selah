import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const CATEGORIES = [
  "personal", "family", "health", "financial", "relationships",
  "work", "spiritual", "community", "world", "thanksgiving", "other",
] as const;

const InteractionSchema = z.object({
  type:            z.literal("interaction"),
  prayerRequestId: z.string().uuid("Invalid prayer request id"),
});

const CreateSchema = z.object({
  title:       z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(3).max(2000),
  category:    z.enum(CATEGORIES).default("personal"),
  isAnonymous: z.boolean().default(false),
  isPublic:    z.boolean().default(false),
});

const UpdateSchema = z.object({
  id:          z.string().uuid("Invalid id"),
  title:       z.string().min(3).max(200).optional(),
  description: z.string().min(3).max(2000).optional(),
  category:    z.enum(CATEGORIES).optional(),
  isAnonymous: z.boolean().optional(),
  isPublic:    z.boolean().optional(),
  isAnswered:  z.boolean().optional(),
  answerNote:  z.string().max(1000).optional().nullable(),
});

const DeleteSchema = z.union([
  z.object({ type: z.literal("request"), prayerRequestId: z.string().uuid() }),
  z.object({ prayerRequestId: z.string().uuid() }),
]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    // Interaction (praying for a request)
    const interaction = InteractionSchema.safeParse(body);
    if (interaction.success) {
      const { error } = await admin.from("prayer_interactions").insert({
        prayer_request_id: interaction.data.prayerRequestId,
        user_id: user.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // New prayer request
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { data, error } = await admin.from("prayer_requests").insert({
      user_id:      user.id,
      title:        parsed.data.title,
      description:  parsed.data.description,
      category:     parsed.data.category,
      is_anonymous: parsed.data.isAnonymous,
      is_public:    parsed.data.isPublic,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    console.error("[/api/prayers POST]", e instanceof Error ? e.message : e);
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

    const { id, isAnonymous, isPublic, isAnswered, answerNote, ...rest } = parsed.data;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("prayer_requests")
      .update({
        ...rest,
        ...(isAnonymous !== undefined && { is_anonymous: isAnonymous }),
        ...(isPublic    !== undefined && { is_public:    isPublic }),
        ...(isAnswered  !== undefined && { is_answered:  isAnswered }),
        ...(answerNote  !== undefined && { answer_note:  answerNote }),
        ...(isAnswered  === true      && { answered_at:  new Date().toISOString() }),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e) {
    console.error("[/api/prayers PATCH]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = DeleteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const admin = createAdminClient();

    if ("type" in parsed.data && parsed.data.type === "request") {
      const { error } = await admin
        .from("prayer_requests")
        .delete()
        .eq("id", parsed.data.prayerRequestId)
        .eq("user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // Remove prayer interaction
    const { error } = await admin
      .from("prayer_interactions")
      .delete()
      .eq("prayer_request_id", parsed.data.prayerRequestId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/prayers DELETE]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
