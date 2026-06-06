import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/backend/auth";
import { deleteUserById, findUserById } from "@/backend/db";
import { checkOrigin, rateLimit } from "@/backend/security";

/*  DELETE /api/auth/delete
    - Verifies the session cookie
    - Permanently removes the user row from the auth DB
    - Clears the session cookie
*/

function clearedCookie(res: NextResponse) {
  res.cookies.set("unfilter_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

async function handle(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ ok: false, errors: ["Bad origin."] }, { status: 403 });
  }

  const rl = rateLimit("delete-account", 5, 15 * 60, req);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, errors: ["Too many requests."] },
      { status: 429 },
    );
  }

  const token = req.cookies.get("unfilter_session")?.value;
  if (!token) {
    return clearedCookie(
      NextResponse.json({ ok: false, errors: ["Not signed in."] }, { status: 401 }),
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return clearedCookie(
      NextResponse.json({ ok: false, errors: ["Invalid session."] }, { status: 401 }),
    );
  }

  const user = findUserById(payload.userId);
  if (!user) {
    return clearedCookie(
      NextResponse.json({ ok: false, errors: ["Account not found."] }, { status: 404 }),
    );
  }

  const currentVersion = user.token_version ?? 0;
  const tokenVersion = (payload as { tokenVersion?: number }).tokenVersion ?? 0;
  if (tokenVersion !== currentVersion) {
    return clearedCookie(
      NextResponse.json({ ok: false, errors: ["Session expired."] }, { status: 401 }),
    );
  }

  deleteUserById(user.id);

  return clearedCookie(NextResponse.json({ ok: true }));
}

export const DELETE = handle;
export const POST = handle;
