import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    if (body.type === "interaction") {
      const { error } = await admin.from("prayer_interactions").insert({
        prayer_request_id: body.prayerRequestId,
        user_id: user.id,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const { data, error } = await admin.from("prayer_requests").insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      is_anonymous: body.isAnonymous,
      is_public: body.isPublic,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/prayers POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prayerRequestId } = await request.json();
    const admin = createAdminClient();
    const { error } = await admin.from("prayer_interactions")
      .delete()
      .eq("prayer_request_id", prayerRequestId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/prayers DELETE]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
