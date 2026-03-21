import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/*  ================================================================
    MIDDLEWARE — Route protection
    Runs before every request. Validates JWT structure + expiry.
    Full cryptographic verification happens in API routes.
    ================================================================ */

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth", "/landing"];

/**
 * Decode a JWT payload without cryptographic verification.
 * Used in middleware to check structure and expiry quickly.
 * Full signature verification happens server-side in API routes.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );

    if (typeof payload !== "object" || payload === null) return null;
    return payload;
  } catch {
    return null;
  }
}

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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validate JWT structure and check expiry
  const payload = decodeJwtPayload(session.value);

  if (!payload) {
    // Malformed token — clear it and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("unfilter_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  // Check required fields exist
  if (!payload.userId || !payload.email || !payload.username) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("unfilter_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  // Check expiry
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("unfilter_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
