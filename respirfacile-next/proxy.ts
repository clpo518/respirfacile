import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 proxy (replaces middleware.ts).
 * Only job: refresh the Supabase auth cookies so server components
 * always see a valid session. All route-level auth checks are handled
 * in each server component via redirect("/auth").
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session — do NOT check result for redirects here.
    // If this throws (network error, Supabase down), we fail open
    // and let the server component handle the auth check.
    await supabase.auth.getUser();
  } catch {
    // Fail open: let the request through, server component will redirect
    // to /auth if the user is truly unauthenticated.
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static files, images, and favicon
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
