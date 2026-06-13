import { NextResponse } from "next/server";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string; eventId: string }>;

export async function POST(_req: Request, { params }: { params: Params }) {
  const { id: churchId, eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get event (use raw because of new columns from migration 018)
  const raw = createRawAdminClient();
  const { data: event } = await raw
    .from("church_events")
    .select("id, registration_required, max_capacity")
    .eq("id", eventId)
    .eq("church_id", churchId)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Check capacity
  let status: "registered" | "waitlisted" = "registered";
  if (event.max_capacity) {
    const { data: countData } = await raw
      .from("church_event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("status", "registered");

    if ((countData?.length ?? 0) >= event.max_capacity) {
      status = "waitlisted";
    }
  }

  const { data, error } = await raw
    .from("church_event_registrations")
    .upsert({ event_id: eventId, user_id: user.id, status }, { onConflict: "event_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ registration: data, status });
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { id: churchId, eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = createRawAdminClient();
  const { error } = await raw
    .from("church_event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
