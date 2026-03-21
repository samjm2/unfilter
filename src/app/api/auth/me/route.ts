import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/backend/auth";
import { findUserById } from "@/backend/db";
import { rateLimit } from "@/backend/security";

/*  GET /api/auth/me
    - Reads session cookie
    - Verifies JWT
    - Returns current user info
    - Rate limited: 30 req / 1 min per IP
*/

export async function GET(req: NextRequest) {
  const rl = rateLimit("me", 30, 60, req);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, user: null, errors: ["Too many requests."] },
      { status: 429 },
    );
  }

  const token = req.cookies.get("unfilter_session")?.value;

  if (!token) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    // Invalid/expired token — clear cookie
    const response = NextResponse.json({ ok: false, user: null }, { status: 401 });
    response.cookies.set("unfilter_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  // Fetch fresh user data
  const user = findUserById(payload.userId);
  if (!user) {
    const response = NextResponse.json({ ok: false, user: null }, { status: 401 });
    response.cookies.set("unfilter_session", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
}
