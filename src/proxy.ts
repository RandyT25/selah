import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

type CookieItem = { name: string; value: string; options: CookieOptions };

const APP_PROTECTED = [
  "/app/home", "/app/bible", "/app/plans", "/app/prayer",
  "/app/profile", "/app/journal", "/app/settings", "/app/search", "/app/discover",
];

const APP_AUTH = ["/app/login", "/app/register", "/app/forgot-password"];

// Legacy /bibleapp → /app redirects
const BIBLEAPP_REDIRECTS: Record<string, string> = {
  "/bibleapp/dashboard": "/app/home",
  "/bibleapp/bible":     "/app/bible",
  "/bibleapp/plans":     "/app/plans",
  "/bibleapp/community/prayer": "/app/prayer",
  "/bibleapp/profile":   "/app/profile",
  "/bibleapp/settings":  "/app/settings",
  "/bibleapp/journal":   "/app/journal",
  "/bibleapp/search":    "/app/search",
  "/bibleapp/login":     "/app/login",
  "/bibleapp/register":  "/app/register",
  "/bibleapp/forgot-password": "/app/forgot-password",
};

const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /bibleapp URLs → /app
  for (const [from, to] of Object.entries(BIBLEAPP_REDIRECTS)) {
    if (pathname === from) {
      return NextResponse.redirect(new URL(to, request.url));
    }
  }

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
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect logged-in users away from auth screens
  if (user && APP_AUTH.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/app/home", request.url));
  }

  // Protect app routes
  if (!user && APP_PROTECTED.some((r) => pathname.startsWith(r))) {
    const url = new URL("/app/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Legacy /bibleapp protected routes
  const BIBLEAPP_PROTECTED = [
    "/bibleapp/dashboard", "/bibleapp/bible", "/bibleapp/audio",
    "/bibleapp/plans", "/bibleapp/devotionals", "/bibleapp/journal",
    "/bibleapp/community", "/bibleapp/settings", "/bibleapp/profile",
    "/bibleapp/ai", "/bibleapp/search",
  ];
  const BIBLEAPP_AUTH = ["/bibleapp/login", "/bibleapp/register", "/bibleapp/forgot-password"];

  if (user && BIBLEAPP_AUTH.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/app/home", request.url));
  }
  if (!user && BIBLEAPP_PROTECTED.some((r) => pathname.startsWith(r))) {
    const url = new URL("/app/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL("/app/login", request.url));
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["admin", "moderator"].includes((profile as { role: string }).role)) {
      return NextResponse.redirect(new URL("/app/home", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
