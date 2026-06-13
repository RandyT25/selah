import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { CookieOptions } from "@supabase/ssr";

type CookieItem = { name: string; value: string; options: CookieOptions };
export type ServerClient = ReturnType<typeof createSupabaseClient<Database>>;

export async function createClient(): Promise<ServerClient> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookie setting is a no-op
          }
        },
      },
    }
  ) as unknown as ServerClient;
}

export function createAdminClient(): ServerClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ) as unknown as ServerClient;
}

// Raw (untyped) admin client for tables added in migrations that haven't been
// regenerated into the TypeScript types yet (e.g. donations, church_subscriptions).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createRawAdminClient(): any {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
