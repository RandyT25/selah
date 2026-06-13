import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

type CookieItem = { name: string; value: string; options: CookieOptions };

// Routes under /bibleapp that don't require authentication
const PUBLIC_BIBLEAPP_ROUTES = [
  "/bibleapp/login",
  "/bibleapp/register",
  "/bibleapp/forgot-password",
  "/bibleapp/onboarding",
  "/bibleapp/checkin",
];

const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith("http") || !supabaseKey || supabaseKey === "your_supabase_anon_key") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: CookieItem[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith("/bibleapp")) {
    const isPublic = PUBLIC_BIBLEAPP_ROUTES.some((r) => pathname.startsWith(r));

    // Logged-in user hitting auth screens → send to dashboard
    if (user && (pathname.startsWith("/bibleapp/login") || pathname.startsWith("/bibleapp/register"))) {
      return NextResponse.redirect(new URL("/bibleapp/dashboard", request.url));
    }

    // Unauthenticated user hitting protected routes → login with ?next= return path
    if (!user && !isPublic) {
      const url = new URL("/bibleapp/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin routes — must be logged in and have admin/moderator role
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL("/bibleapp/login", request.url));
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "moderator"].includes((profile as { role: string }).role)) {
      return NextResponse.redirect(new URL("/bibleapp/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
