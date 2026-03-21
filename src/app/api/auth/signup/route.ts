import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, findUserByUsername, verifyUser } from "@/backend/db";
import {
  hashPassword,
  generateVerificationToken,
  sendVerificationEmail,
  hasSmtpConfigured,
} from "@/backend/auth";
import { rateLimit, checkOrigin } from "@/backend/security";

/*  POST /api/auth/signup
    Body: { username, email, password }
    Security: rate limited (5 signups / 15 min), CSRF origin check
    Production: requires SMTP — no auto-verify
*/

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    if (!checkOrigin(req)) {
      return NextResponse.json(
        { ok: false, errors: ["Request blocked."] },
        { status: 403 },
      );
    }

    // Rate limit: 5 signups per IP per 15 minutes
    const rl = rateLimit("signup", 5, 15 * 60, req);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, errors: [`Too many signup attempts. Try again in ${rl.retryAfterSec} seconds.`] },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { username, email, password } = body;

    // Validation
    const errors: string[] = [];

    if (!username || typeof username !== "string") {
      errors.push("Username is required.");
    } else if (username.length < 3 || username.length > 24) {
      errors.push("Username must be 3-24 characters.");
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push("Username can only contain letters, numbers, and underscores.");
    }

    if (!email || typeof email !== "string") {
      errors.push("Email is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email address.");
    }

    if (!password || typeof password !== "string") {
      errors.push("Password is required.");
    } else if (password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    } else if (password.length > 128) {
      errors.push("Password must be 128 characters or fewer.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // Check duplicates — use same generic message to prevent enumeration
    const emailExists = findUserByEmail(email);
    const usernameExists = findUserByUsername(username);

    if (emailExists || usernameExists) {
      return NextResponse.json(
        { ok: false, errors: ["An account with this email or username already exists."] },
        { status: 409 },
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const user = createUser(username, email, passwordHash, verificationToken);

    // Email verification
    if (hasSmtpConfigured()) {
      await sendVerificationEmail(email, username, verificationToken);
      return NextResponse.json({
        ok: true,
        message: "Account created. Check your email for a verification link.",
        autoVerified: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: false,
        },
      });
    }

    if (IS_PRODUCTION) {
      // Production without SMTP = broken setup. Don't auto-verify.
      // Account is created but unusable until SMTP is configured.
      return NextResponse.json({
        ok: true,
        message: "Account created. Email verification is temporarily unavailable. Please try again later.",
        autoVerified: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: false,
        },
      });
    }

    // Dev mode only: auto-verify so login works without SMTP
    verifyUser(user.id);
    return NextResponse.json({
      ok: true,
      message: "Account created and verified. You can log in now.",
      autoVerified: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: true,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Something went wrong. Please try again."] },
      { status: 500 },
    );
  }
}
