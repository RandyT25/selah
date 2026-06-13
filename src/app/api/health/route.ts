import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (e) {
    console.error("[/api/health]", e instanceof Error ? e.message : e);
    return NextResponse.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
