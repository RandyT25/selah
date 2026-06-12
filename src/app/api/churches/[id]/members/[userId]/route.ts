import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string; userId: string }> }

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>, churchId: string, callerId: string) {
  const { data } = await supabase
    .from("church_members")
    .select("role")
    .eq("church_id", churchId)
    .eq("user_id", callerId)
    .single();
  return data?.role === "admin";
}

// PATCH: change member role
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await requireAdmin(supabase, id, user.id))) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { role } = await request.json();
    if (!["admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { error } = await supabase
      .from("church_members")
      .update({ role })
      .eq("church_id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: remove member from church
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id, userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await requireAdmin(supabase, id, user.id))) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // Prevent removing the last admin
    const { data: admins } = await supabase
      .from("church_members")
      .select("user_id")
      .eq("church_id", id)
      .eq("role", "admin");

    if ((admins ?? []).length === 1 && admins![0].user_id === userId) {
      return NextResponse.json({ error: "Cannot remove the last admin" }, { status: 400 });
    }

    const { error } = await supabase
      .from("church_members")
      .delete()
      .eq("church_id", id)
      .eq("user_id", userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
