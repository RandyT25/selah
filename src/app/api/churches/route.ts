import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ChurchCreateSchema = z.object({
  name:        z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional().nullable(),
  address:     z.string().max(500).optional().nullable(),
  city:        z.string().min(2, "City is required").max(100),
  province:    z.string().max(100).optional().nullable(),
  denomination:z.string().max(100).optional().nullable(),
  pastorName:  z.string().max(100).optional().nullable(),
  website:     z.string().url("Enter a valid URL").optional().nullable().or(z.literal("")),
  logo_url:    z.string().url().optional().nullable(),
  latitude:    z.number().min(-90).max(90).optional().nullable(),
  longitude:   z.number().min(-180).max(180).optional().nullable(),
});

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const radiusKm = Math.min(parseFloat(searchParams.get("radius") ?? "20"), 200);

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("churches")
      .select("id, name, city, province, logo_url, latitude, longitude, member_count, denomination")
      .order("member_count", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let churches = data ?? [];

    if (!isNaN(lat) && !isNaN(lng)) {
      churches = churches
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => ({ ...c, distance_km: haversineKm(lat, lng, c.latitude!, c.longitude!) }))
        .filter((c) => (c as { distance_km: number }).distance_km <= radiusKm)
        .sort((a, b) => (a as { distance_km: number }).distance_km - (b as { distance_km: number }).distance_km);
    }

    return NextResponse.json({ data: churches });
  } catch (e) {
    console.error("[/api/churches GET]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = ChurchCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { pastorName, website, ...rest } = parsed.data;
    const admin = createAdminClient();

    const { data: church, error: churchErr } = await admin
      .from("churches")
      .insert({
        ...rest,
        pastor_name: pastorName || null,
        website:     website || null,
        created_by:  user.id,
      })
      .select()
      .single();

    if (churchErr) return NextResponse.json({ error: churchErr.message }, { status: 500 });

    const { error: memberErr } = await admin
      .from("church_members")
      .insert({ church_id: church.id, user_id: user.id, role: "admin" });

    if (memberErr) {
      await admin.from("churches").delete().eq("id", church.id);
      return NextResponse.json({ error: memberErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: church }, { status: 201 });
  } catch (e) {
    console.error("[/api/churches POST]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
