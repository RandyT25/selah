import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

const Schema = z.object({ event_id: z.string().uuid() });

async function isChurchPlus(churchId: string): Promise<boolean> {
  const raw = createRawAdminClient();
  const { data } = await raw
    .from("church_subscriptions")
    .select("plan, status")
    .eq("church_id", churchId)
    .maybeSingle();
  return data?.plan === "plus" && data?.status === "active";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: churchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberRes = await supabase
    .from("church_members").select("role").eq("church_id", churchId).eq("user_id", user.id).single();
  if (memberRes.data?.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  if (!await isChurchPlus(churchId)) return NextResponse.json({ error: "Church Plus required" }, { status: 402 });

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid event_id" }, { status: 400 });

  const { data: event } = await supabase
    .from("church_events").select("id").eq("id", parsed.data.event_id).eq("church_id", churchId).single();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const raw = createRawAdminClient();
  const { data, error } = await raw
    .from("checkin_tokens")
    .insert({ event_id: parsed.data.event_id, token, expires_at: expiresAt, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://selah-umber.vercel.app";
  const checkinUrl = `${APP_URL}/bibleapp/checkin?token=${token}`;

  return NextResponse.json({ token, checkinUrl, expiresAt: data.expires_at });
}
