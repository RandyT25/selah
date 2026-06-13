import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

const Schema = z.object({
  token:      z.string().min(16),
  guest_name: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const raw = createRawAdminClient();

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const { token, guest_name } = parsed.data;

  // Look up token (raw — checkin_tokens and church_events not in generated types)
  const { data: tokenRow } = await raw
    .from("checkin_tokens")
    .select("*, church_events(id, church_id, title)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!tokenRow) {
    return NextResponse.json({ error: "Invalid or expired check-in token" }, { status: 400 });
  }

  const event = tokenRow.church_events as { id: string; church_id: string; title: string } | null;
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (!user && !guest_name) {
    return NextResponse.json({ error: "Please provide your name to check in as a guest" }, { status: 400 });
  }

  // Record attendance (raw — church_attendance not in generated types)
  const { data, error } = await raw
    .from("church_attendance")
    .upsert({
      church_id:       event.church_id,
      event_id:        event.id,
      user_id:         user?.id ?? null,
      guest_name:      user ? null : (guest_name ?? null),
      check_in_method: "qr",
    }, { onConflict: "event_id,user_id" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already checked in!", event: event.title }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Checked in!", event: event.title, attendance: data });
}
