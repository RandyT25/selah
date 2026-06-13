import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_BIBLEAPP_ROUTES = [
  "/bibleapp/login",
  "/bibleapp/register",
  "/bibleapp/forgot-password",
  "/bibleapp/onboarding",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Only guard /bibleapp/* routes
  if (!pathname.startsWith("/bibleapp")) {
    return response;
  }

  // Allow public auth routes through
  if (PUBLIC_BIBLEAPP_ROUTES.some((r) => pathname.startsWith(r))) {
    return response;
  }

  // Allow the QR check-in landing page (no auth needed for guests)
  if (pathname.startsWith("/bibleapp/checkin")) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/bibleapp/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/bibleapp/:path*"],
};
