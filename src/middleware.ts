import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

type CookieItem = { name: string; value: string; options: CookieOptions };

// ── Bible App routes (all under /bibleapp) ──────────────────────────────────
const BIBLEAPP_PROTECTED = [
  "/bibleapp/dashboard",
  "/bibleapp/bible",
  "/bibleapp/audio",
  "/bibleapp/plans",
  "/bibleapp/devotionals",
  "/bibleapp/journal",
  "/bibleapp/community",
  "/bibleapp/settings",
  "/bibleapp/profile",
  "/bibleapp/ai",
  "/bibleapp/search",
];

const BIBLEAPP_AUTH = [
  "/bibleapp/login",
  "/bibleapp/register",
  "/bibleapp/forgot-password",
];

const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith("http") || !supabaseKey || supabaseKey === "your_supabase_anon_key") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Bible App: redirect logged-in users away from auth pages
  if (user && BIBLEAPP_AUTH.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/bibleapp/dashboard", request.url));
  }

  // Bible App: protect app routes — redirect to app login
  if (!user && BIBLEAPP_PROTECTED.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/bibleapp/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/bibleapp/login", request.url));
    }
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
