import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

const Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name:  z.string().max(100).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, name } = parsed.data;

    // Get user_id if logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createRawAdminClient();
    const { error } = await admin.from("upgrade_waitlist").upsert(
      { email, name: name ?? null, user_id: user?.id ?? null, source: "upgrade_page" },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[/api/upgrade/waitlist]", error.message);
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/upgrade/waitlist]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
