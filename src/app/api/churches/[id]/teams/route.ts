import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createRawAdminClient } from "@/lib/supabase/server";

const CreateSchema = z.object({
  name:        z.string().min(1).max(80),
  description: z.string().max(500).optional().nullable(),
  leader_id:   z.string().uuid().optional().nullable(),
});

async function isChurchPlus(churchId: string): Promise<boolean> {
  const raw = createRawAdminClient();
  const { data } = await raw
    .from("church_subscriptions")
    .select("plan, status")
    .eq("church_id", churchId)
    .maybeSingle();
  return data?.plan === "plus" && data?.status === "active";
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: churchId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberRes = await supabase
    .from("church_members").select("role").eq("church_id", churchId).eq("user_id", user.id).single();
  if (!memberRes.data) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const raw = createRawAdminClient();
  const { data, error } = await raw
    .from("church_teams")
    .select("*, leader:leader_id(id, full_name, display_name, avatar_url)")
    .eq("church_id", churchId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teams: data });
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

  const parsed = CreateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const raw = createRawAdminClient();
  const { data, error } = await raw
    .from("church_teams")
    .insert({ church_id: churchId, ...parsed.data })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ team: data }, { status: 201 });
}
