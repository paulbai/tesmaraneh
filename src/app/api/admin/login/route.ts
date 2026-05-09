import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifyAdminPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

// Loose RFC-5321 shape — local-part@domain.tld. Stops obvious junk before
// we hit the DB; not a strict validator (we don't need that — the admins
// allowlist is the real check).
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const LOGIN_RATE_LIMIT = {
  capacity: 5, // 5 attempts in window
  refillTokens: 5,
  windowMs: 15 * 60_000, // per 15 minutes
};

export async function POST(req: NextRequest) {
  // Per-IP throttle so a credential-stuffing bot can't hammer this endpoint.
  // (See lib/rate-limit.ts for the serverless caveat — this is best-effort.)
  const ip = clientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, LOGIN_RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      }
    );
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  if (email.length > 320 || password.length > 200 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Lookup admin first. We still run password verification on a miss to
  // keep login timing constant (don't leak which emails are admins).
  const [admin] = await db
    .select({ id: admins.id, email: admins.email })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  let passwordOk: boolean;
  try {
    passwordOk = verifyAdminPassword(password);
  } catch (err) {
    console.error("[admin login] password env missing:", err);
    return NextResponse.json(
      { error: "Server auth misconfigured" },
      { status: 500 }
    );
  }

  if (!admin || !passwordOk) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  await db
    .update(admins)
    .set({ lastLoginAt: new Date() })
    .where(eq(admins.id, admin.id));

  const token = signSession(admin.email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
