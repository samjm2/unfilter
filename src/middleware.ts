import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*  ================================================================
    MIDDLEWARE — Route protection at the edge
    Runs before every request. Checks for session cookie.
    Redirects to /login if no session and accessing protected route.
    ================================================================ */

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth", "/landing"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get("unfilter_session");

  if (!session?.value) {
    // Redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Has cookie — allow through (JWT validation happens in API routes)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
