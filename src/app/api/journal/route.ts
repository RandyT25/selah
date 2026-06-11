import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from("journal_entries")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/journal POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("journal_entries")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/journal PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
