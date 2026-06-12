import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    const { data: church, error: churchErr } = await admin
      .from("churches")
      .insert({
        name: body.name,
        description: body.description || null,
        address: body.address || null,
        city: body.city,
        province: body.province || null,
        denomination: body.denomination || null,
        pastor_name: body.pastorName || null,
        website: body.website || null,
        latitude: typeof body.latitude === "number" ? body.latitude : null,
        longitude: typeof body.longitude === "number" ? body.longitude : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (churchErr) return NextResponse.json({ error: churchErr.message }, { status: 500 });

    // Creator becomes admin automatically
    const { error: memberErr } = await admin
      .from("church_members")
      .insert({ church_id: church.id, user_id: user.id, role: "admin" });

    if (memberErr) {
      await admin.from("churches").delete().eq("id", church.id);
      return NextResponse.json({ error: memberErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: church });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/churches POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
