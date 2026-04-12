import { NextRequest, NextResponse } from "next/server";
import {
  findUserByResetToken,
  applyPasswordReset,
  cleanupExpiredResetTokens,
} from "@/backend/db";
import { hashPassword } from "@/backend/auth";
import { rateLimit, checkOrigin } from "@/backend/security";

/*  POST /api/auth/reset-password
    Body: { token, password }
    Validates the reset token, updates the password hash, and bumps the user's
    token_version so any existing JWTs are invalidated.
    Rate limited: 10 per IP per 15 minutes.
*/

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json(
        { ok: false, errors: ["Request blocked."] },
        { status: 403 },
      );
    }

    const rl = rateLimit("reset-password", 10, 15 * 60, req);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          ok: false,
          errors: [`Too many requests. Try again in ${rl.retryAfterSec} seconds.`],
        },
        { status: 429 },
      );
    }

    // Opportunistic cleanup of expired reset tokens
    cleanupExpiredResetTokens();

    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { ok: false, errors: ["Reset token is required."] },
        { status: 400 },
      );
    }

    // Tokens are 64-char hex (crypto.randomBytes(32).toString("hex"))
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { ok: false, errors: ["Invalid or expired reset link."] },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { ok: false, errors: ["New password is required."] },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, errors: ["Password must be at least 8 characters."] },
        { status: 400 },
      );
    }
    if (password.length > 128) {
      return NextResponse.json(
        { ok: false, errors: ["Password must be 128 characters or fewer."] },
        { status: 400 },
      );
    }

    const user = findUserByResetToken(token);

    if (!user) {
      return NextResponse.json(
        { ok: false, errors: ["Invalid or expired reset link."] },
        { status: 400 },
      );
    }

    if (!user.reset_expires || Date.now() > user.reset_expires) {
      return NextResponse.json(
        { ok: false, errors: ["Invalid or expired reset link."] },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    applyPasswordReset(user.id, passwordHash);

    return NextResponse.json({
      ok: true,
      message: "Password reset. You can now log in with your new password.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Something went wrong. Please try again."] },
      { status: 500 },
    );
  }
}
