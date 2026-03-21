import { NextRequest, NextResponse } from "next/server";
import { findUserByVerificationToken, verifyUser, cleanupExpiredTokens } from "@/backend/db";

/*  GET /api/auth/verify?token=xxx
    - Finds user by verification token
    - Checks expiration
    - Marks user as verified
    - Cleans up expired tokens
    - Redirects to login page
*/

export async function GET(req: NextRequest) {
  // Opportunistic cleanup of expired tokens
  cleanupExpiredTokens();

  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  // Validate token format (should be 64-char hex string)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const user = findUserByVerificationToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  if (user.verification_expires && Date.now() > user.verification_expires) {
    return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
  }

  verifyUser(user.id);
  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
