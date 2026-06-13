import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
      .from("church_members")
      .select("role")
      .eq("church_id", id)
      .eq("user_id", user.id)
      .single();

    if (membership?.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from("churches")
      .update({
        name:         body.name,
        description:  body.description  || null,
        address:      body.address      || null,
        city:         body.city,
        province:     body.province     || null,
        denomination: body.denomination || null,
        pastor_name:  body.pastorName   || null,
        website:      body.website      || null,
        logo_url:     body.logo_url     || null,
        latitude:     typeof body.latitude  === "number" ? body.latitude  : null,
        longitude:    typeof body.longitude === "number" ? body.longitude : null,
        updated_at:   new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
