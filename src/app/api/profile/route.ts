import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const [{ data: profile }, { data: prefs }] = await Promise.all([
      admin.from("profiles").select("*").eq("id", user.id).single(),
      admin.from("user_preferences").select("*").eq("user_id", user.id).single(),
    ]);

    return NextResponse.json({ profile, prefs });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/profile GET]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    console.log("[/api/profile PATCH] body keys:", Object.keys(body), "userId:", user.id);

    const admin = createAdminClient();
    const { error, data } = await admin.from("profiles").update(body).eq("id", user.id).select();

    if (error) {
      console.error("[/api/profile PATCH] supabase error:", error.message, error.code, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("[/api/profile PATCH] updated rows:", data?.length ?? 0);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    console.error("[/api/profile PATCH] exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
