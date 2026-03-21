import { NextRequest } from "next/server";

/*  ================================================================
    SECURITY UTILITIES
    - In-memory rate limiter (per IP)
    - CSRF origin validation
    ================================================================ */

/* ---- Rate Limiter ---- */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * In-memory rate limiter keyed by IP address.
 * Returns { allowed, remaining, retryAfterSec }.
 *
 * @param name   — unique bucket name (e.g. "login", "signup")
 * @param limit  — max requests per window
 * @param windowSec — time window in seconds
 * @param req    — Next.js request (used to extract IP)
 */
export function rateLimit(
  name: string,
  limit: number,
  windowSec: number,
  req: NextRequest,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name)!;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = store.get(ip);

  // Clean up expired entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, val] of store) {
      if (now > val.resetAt) store.delete(key);
    }
  }

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(ip, { count: 1, resetAt: now + windowSec * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  entry.count++;
  if (entry.count > limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return { allowed: true, remaining: limit - entry.count, retryAfterSec: 0 };
}

/* ---- CSRF Origin Check ---- */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Validates that the request Origin or Referer matches our app URL.
 * Returns true if the request is safe to process.
 */
export function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // In development, allow requests without origin (e.g. Postman, curl)
  if (process.env.NODE_ENV !== "production") return true;

  const appOrigin = new URL(APP_URL).origin;

  if (origin) return origin === appOrigin;
  if (referer) {
    try {
      return new URL(referer).origin === appOrigin;
    } catch {
      return false;
    }
  }

  // No origin or referer in production = reject
  return false;
}
