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
 * Resolve the client IP for rate-limiting purposes.
 *
 * Trust order:
 *   1. If TRUSTED_IP_HEADER is set, ONLY that header is trusted. Use this in
 *      production behind a proxy that overwrites it (Vercel sets
 *      `x-vercel-forwarded-for`, Cloudflare sets `cf-connecting-ip`, etc.).
 *   2. Otherwise, use NextRequest.ip if the runtime provides it (Edge).
 *   3. In real local development only, fall back to `x-forwarded-for`.
 *   4. Anything else collapses into a single shared bucket so the rate limit
 *      degrades to a *global* limit instead of failing open. This makes a
 *      misconfiguration noisy rather than silently bypassable.
 */
function getClientIp(req: NextRequest): string {
  const trustedHeader = process.env.TRUSTED_IP_HEADER;
  if (trustedHeader) {
    const raw = req.headers.get(trustedHeader);
    if (raw) return raw.split(",")[0]?.trim() || "unknown";
  }

  const reqIp = (req as unknown as { ip?: string }).ip;
  if (reqIp) return reqIp;

  if (process.env.NODE_ENV === "development") {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || "unknown";
    return req.headers.get("x-real-ip") || "unknown";
  }

  // Production with no configured trusted header AND no req.ip:
  // bucket all requests together so the rate limit still applies globally.
  return "untrusted-source";
}

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

  const ip = getClientIp(req);

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

  // Allow tools without an Origin header (Postman, curl) ONLY in real local
  // development. Any other NODE_ENV (production, staging, test, undefined)
  // must enforce origin checks — staging deploys are still attacker-reachable.
  if (process.env.NODE_ENV === "development") return true;

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
