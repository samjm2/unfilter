import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, resetVerificationToken } from "@/backend/db";
import { generateVerificationToken, sendVerificationEmail, hasSmtpConfigured } from "@/backend/auth";
import { rateLimit, checkOrigin } from "@/backend/security";

/*  POST /api/auth/resend
    Body: { email }
    Resends verification email with a fresh token.
    Rate limited: 3 per IP per 15 minutes.
*/

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json({ ok: false, errors: ["Request blocked."] }, { status: 403 });
    }

    // Strict rate limit — prevent email spam
    const rl = rateLimit("resend", 3, 15 * 60, req);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, errors: [`Too many requests. Try again in ${rl.retryAfterSec} seconds.`] },
        { status: 429 },
      );
    }

    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json({ ok: false, errors: ["Email is required."] }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const genericSuccess = {
      ok: true,
      message: "If an account with that email exists and is unverified, a new verification link has been sent.",
    };

    const user = findUserByEmail(email);
    if (!user || user.email_verified) {
      // Don't reveal whether the email exists
      return NextResponse.json(genericSuccess);
    }

    if (!hasSmtpConfigured()) {
      return NextResponse.json(genericSuccess);
    }

    // Generate fresh token and send
    const newToken = generateVerificationToken();
    resetVerificationToken(user.id, newToken);
    await sendVerificationEmail(email, user.username, newToken);

    return NextResponse.json(genericSuccess);
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Something went wrong."] },
      { status: 500 },
    );
  }
}
