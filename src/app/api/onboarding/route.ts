import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Use a raw admin client here — onboarding writes to columns added in migration 015
// (denomination, reading_goal_chapters_per_week, onboarding_step) that are not yet
// in the generated types. Using `any` here is intentional until types are regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rawAdminClient(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const Schema = z.object({
  denomination:                   z.string().max(100).optional().nullable(),
  reading_goal_chapters_per_week: z.number().int().min(1).max(49).optional(),
  language:                       z.enum(["en", "id"]).optional(),
  completed:                      z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { denomination, reading_goal_chapters_per_week, language, completed } = parsed.data;
    const admin = rawAdminClient();

    const prefUpdate: Record<string, unknown> = {};
    if (denomination              !== undefined) prefUpdate.denomination = denomination;
    if (reading_goal_chapters_per_week !== undefined) prefUpdate.reading_goal_chapters_per_week = reading_goal_chapters_per_week;
    if (language                  !== undefined) prefUpdate.language = language;

    const tasks: Promise<unknown>[] = [];

    if (Object.keys(prefUpdate).length > 0) {
      tasks.push(admin.from("user_preferences").update(prefUpdate).eq("user_id", user.id));
    }

    if (completed) {
      tasks.push(
        admin.from("profiles").update({ onboarding_completed: true, onboarding_step: 4 }).eq("id", user.id)
      );
    }

    await Promise.allSettled(tasks);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/onboarding POST]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
