import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

const RecordSchema = z.object({
  event_id:         z.string().uuid(),
  user_id:          z.string().uuid().optional(),
  guest_name:       z.string().max(100).optional(),
  check_in_method:  z.enum(["qr", "manual", "self"]).default("manual"),
});

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>, churchId: string, userId: string) {
  const { data } = await supabase
    .from("church_members").select("role").eq("church_id", churchId).eq("user_id", userId).single();
  return data?.role === "admin";
}

async function isChurchPlus(churchId: string): Promise<boolean> {
  const raw = createRawAdminClient();
  const { data } = await raw
    .from("church_subscriptions")
    .select("plan, status")
    .eq("church_id", churchId)
    .maybeSingle();
  return data?.plan === "plus" && data?.status === "active";
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: churchId } = await params;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await verifyAdmin(supabase, churchId, user.id)) return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const raw = createRawAdminClient();
  let query = raw
    .from("church_attendance")
    .select("*, profiles:user_id(id, full_name, display_name, avatar_url)")
    .eq("church_id", churchId)
    .order("checked_in_at", { ascending: false });

  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: churchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await verifyAdmin(supabase, churchId, user.id)) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  if (!await isChurchPlus(churchId)) return NextResponse.json({ error: "Church Plus required" }, { status: 402 });

  const parsed = RecordSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const raw = createRawAdminClient();
  const { data, error } = await raw
    .from("church_attendance")
    .upsert({
      church_id:       churchId,
      event_id:        parsed.data.event_id,
      user_id:         parsed.data.user_id ?? null,
      guest_name:      parsed.data.guest_name ?? null,
      check_in_method: parsed.data.check_in_method,
      checked_in_by:   user.id,
    }, { onConflict: "event_id,user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ attendance: data }, { status: 201 });
}
