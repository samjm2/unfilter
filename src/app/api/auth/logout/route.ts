import { NextRequest, NextResponse } from "next/server";
import { checkOrigin } from "@/backend/security";

/*  POST /api/auth/logout
    - Validates origin (CSRF protection)
    - Clears the session cookie
*/

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json(
      { ok: false, errors: ["Request blocked."] },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("unfilter_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
