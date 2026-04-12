import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, setResetToken, cleanupExpiredResetTokens } from "@/backend/db";
import {
  generateVerificationToken,
  sendPasswordResetEmail,
  hasSmtpConfigured,
} from "@/backend/auth";
import { rateLimit, checkOrigin } from "@/backend/security";

/*  POST /api/auth/forgot-password
    Body: { email }
    Always returns the same generic message to prevent email enumeration.
    Rate limited: 3 per IP per 15 minutes.
*/

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json(
        { ok: false, errors: ["Request blocked."] },
        { status: 403 },
      );
    }

    const rl = rateLimit("forgot-password", 3, 15 * 60, req);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          ok: false,
          errors: [
            `Too many password reset requests. Try again in ${rl.retryAfterSec} seconds.`,
          ],
        },
        { status: 429 },
      );
    }

    // Opportunistic cleanup of expired reset tokens
    cleanupExpiredResetTokens();

    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, errors: ["Email is required."] },
        { status: 400 },
      );
    }

    // Always return the same response shape regardless of whether the email
    // exists or is verified — prevents account enumeration.
    const genericSuccess = {
      ok: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };

    const user = findUserByEmail(email);

    // Only issue a token if the user exists AND has verified their email.
    // Resetting an unverified account would let an attacker who guesses an
    // email take it over before the real owner clicks the verify link.
    if (!user || !user.email_verified) {
      return NextResponse.json(genericSuccess);
    }

    if (!hasSmtpConfigured() && process.env.NODE_ENV !== "development") {
      // Production without SMTP — pretend success but don't actually issue a token
      return NextResponse.json(genericSuccess);
    }

    const token = generateVerificationToken();
    setResetToken(user.id, token);
    await sendPasswordResetEmail(email, user.username, token);

    return NextResponse.json(genericSuccess);
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Something went wrong. Please try again."] },
      { status: 500 },
    );
  }
}
