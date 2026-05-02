import type { NextRequest } from "next/server";

/** In-memory per-IP token-bucket rate limiter.
 *
 *  Caveats — read these before relying on this for security:
 *
 *  - Vercel runs each route on a serverless function instance. The Map below
 *    lives in that instance's heap, so a single attacker hitting different
 *    cold instances bypasses the limit. This is a best-effort defense, not a
 *    hard guarantee. For real per-IP throttling at scale, swap this for an
 *    Upstash/Redis-backed limiter (e.g. `@upstash/ratelimit`).
 *  - Edge runtime has its own isolate per region; we deliberately stay on
 *    `runtime = "nodejs"` for the routes that use this so the bucket sticks
 *    longer.
 *  - Trusts `x-forwarded-for` because Vercel's load balancer sets it. Do not
 *    deploy behind a host that doesn't strip client-supplied versions of the
 *    header — an attacker could spoof their IP.
 *
 *  Despite the caveats, this still raises the cost of casual flooding from
 *  zero to "you need a botnet," which is enough to deter the common case.
 */

type Bucket = {
  tokens: number;
  /** Wall-clock ms when the bucket was last refilled. */
  lastRefillMs: number;
};

const buckets = new Map<string, Bucket>();

/** Best-effort cleanup so the Map doesn't grow forever on a long-lived
 *  warm instance. Called opportunistically on every check. */
function gc(now: number, oldestKept: number) {
  if (buckets.size < 10_000) return;
  for (const [key, b] of buckets) {
    if (b.lastRefillMs < oldestKept) buckets.delete(key);
  }
}

export interface RateLimitConfig {
  /** Bucket capacity — also the burst allowance. */
  capacity: number;
  /** How many tokens refill per `windowMs`. */
  refillTokens: number;
  /** Refill window in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Tokens remaining after this request (post-deduction if `ok`). */
  remaining: number;
  /** Wall-clock ms until the bucket has at least 1 token again. 0 if `ok`. */
  retryAfterMs: number;
}

export function rateLimit(
  key: string,
  cfg: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  gc(now, now - cfg.windowMs * 10);

  const existing = buckets.get(key);
  let bucket: Bucket;
  if (!existing) {
    bucket = { tokens: cfg.capacity, lastRefillMs: now };
    buckets.set(key, bucket);
  } else {
    // Refill proportional to elapsed time since last refill.
    const elapsed = now - existing.lastRefillMs;
    const refilled =
      elapsed > 0
        ? (elapsed / cfg.windowMs) * cfg.refillTokens
        : 0;
    bucket = {
      tokens: Math.min(cfg.capacity, existing.tokens + refilled),
      lastRefillMs: now,
    };
    buckets.set(key, bucket);
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { ok: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
  }

  // Bucket dry — tell caller how long until 1 full token would refill.
  const tokensNeeded = 1 - bucket.tokens;
  const retryAfterMs = Math.ceil(
    (tokensNeeded / cfg.refillTokens) * cfg.windowMs
  );
  return { ok: false, remaining: 0, retryAfterMs };
}

/** Pull the client IP out of the request, preferring Vercel's
 *  `x-forwarded-for` (first hop is the real client). Falls back to a
 *  literal "unknown" when no headers are set — that bucket becomes the
 *  shared bucket for unknown clients, which is fine. */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip")?.trim() ??
    req.headers.get("cf-connecting-ip")?.trim() ??
    "unknown"
  );
}
