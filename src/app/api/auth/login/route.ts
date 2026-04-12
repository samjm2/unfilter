import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, getAccountLockRemaining, recordFailedLogin, resetFailedAttempts } from "@/backend/db";
import { verifyPassword, signToken, hashPassword } from "@/backend/auth";
import { rateLimit, checkOrigin } from "@/backend/security";

// pre-compute a dummy hash for non existent users for preventing timing attacks
let DUMMY_HASH: string | null = null;
async function getDummyHash() {
  if (!DUMMY_HASH) DUMMY_HASH = await hashPassword("timing-safe-dummy-password");
  return DUMMY_HASH;
}

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    if (!checkOrigin(req)) {
      return NextResponse.json(
        { ok: false, errors: ["Request blocked."] },
        { status: 403},
      );
    }

    //rate limit-10 login attempts per 15 minutes per IP
    const rl = rateLimit("login", 10, 15 * 60, req);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, errors: [`Too many login attempts. Try again in ${rl.retryAfterSec} seconds.`] },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, errors: ["Email and password are required."] },
        { status: 400},
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user — always run bcrypt even if user doesn't exist (timing-safe)
    const user = findUserByEmail(trimmedEmail);
    const hashToCompare = user?.password_hash ?? await getDummyHash();

    // Check account lockout — return same message as invalid credentials
    // to prevent attackers from discovering which emails have accounts
    if (user) {
      const lockSec = getAccountLockRemaining(user);
      if (lockSec > 0) {
        // Still run bcrypt to maintain consistent timing
        await verifyPassword(password, hashToCompare).catch(() => {});
        return NextResponse.json(
          { ok: false, errors: ["Invalid email or password."] },
          { status: 401 },
        );
      }
    }

    let valid = false;
    try {
      valid = await verifyPassword(password, hashToCompare);
    } catch {
      return NextResponse.json(
        { ok: false, errors: ["Authentication error. Please try again."] },
        { status: 500 },
      );
    }

    if (!user || !valid) {
      // Record failed attempt if user exists
      if (user) recordFailedLogin(user.id);
      return NextResponse.json(
        { ok: false, errors: ["Invalid email or password."] },
        { status: 401 },
      );
    }

    // Check email verification
    if (!user.email_verified) {
      return NextResponse.json(
        {
          ok: false,
          errors: ["Please verify your email before logging in. Check your inbox."],
          needsVerification: true,
        },
        { status: 403 },
      );
    }

    // Success — reset failed attempts
    resetFailedAttempts(user.id);

    // Issue JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      tokenVersion: user.token_version ?? 0,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

    response.cookies.set("unfilter_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, errors: ["Something went wrong. Please try again."] },
      { status: 500 },
    );
  }
}
