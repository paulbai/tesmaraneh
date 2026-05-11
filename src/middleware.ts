import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Defense-in-depth: reject requests to admin routes that don't carry the
 *  session cookie. This runs at the edge BEFORE the route handler, so even
 *  if a developer forgets an auth check in a new route, the middleware
 *  catches it.
 *
 *  Exceptions: /admin/login (and its API) must be accessible without a cookie. */

const SESSION_COOKIE = "tes_admin";

/** Paths that DON'T require the session cookie. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate /admin and /api/admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminRoute) return NextResponse.next();

  // Allow public admin paths (login page + login API)
  if (isPublicAdminPath(pathname)) return NextResponse.next();

  // Check for the session cookie (presence only — full HMAC verification
  // happens in the route handler / layout via getCurrentAdmin())
  const cookie = req.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) {
    // For API routes, return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // For pages, redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
