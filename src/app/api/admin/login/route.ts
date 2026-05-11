import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, lt } from "drizzle-orm";
import { randomInt, createHash } from "node:crypto";
import { db } from "@/lib/db";
import { admins, adminOtps, notificationPhones } from "@/lib/db/schema";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth";
import { sendSms } from "@/lib/sms";
import { normalizePhone } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type LoginBody = {
  phone?: string;
  otp?: string;
  step?: "request" | "verify";
};

const OTP_TTL_MS = 10 * 60_000; // 10 minutes

const REQUEST_RATE_LIMIT = {
  capacity: 5,
  refillTokens: 5,
  windowMs: 15 * 60_000,
};

const VERIFY_RATE_LIMIT = {
  capacity: 8,
  refillTokens: 8,
  windowMs: 15 * 60_000,
};

/** Per-phone rate limit for OTP verification — prevents distributed brute force. */
const VERIFY_PHONE_RATE_LIMIT = {
  capacity: 5,
  refillTokens: 5,
  windowMs: 15 * 60_000,
};

/** Generate a 6-digit numeric OTP (100000–999999 inclusive). */
function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

/** Hash an OTP code for storage. Uses SHA-256 with the phone as salt. */
function hashOtp(code: string, phone: string): string {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid phone number (e.g. 23275696192 or 075696192)" },
      { status: 400 }
    );
  }

  // ─── Step 1: Request OTP ───
  if (body.step === "request" || !body.otp) {
    const limit = rateLimit(`otp-request:${ip}`, REQUEST_RATE_LIMIT);
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

    // Check if phone is in admin allowlist
    const [admin] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.phone, phone))
      .limit(1);

    // Always respond the same to avoid leaking which phones are admins
    if (!admin) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
      return NextResponse.json({
        ok: true,
        message: "If this number is registered, a code has been sent.",
      });
    }

    // Invalidate all existing unused OTPs for this phone
    await db
      .update(adminOtps)
      .set({ used: true })
      .where(
        and(eq(adminOtps.phone, phone), eq(adminOtps.used, false))
      );

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Store hashed OTP
    await db.insert(adminOtps).values({
      phone,
      code: hashOtp(code, phone),
      expiresAt,
    });

    // Cleanup expired OTPs (fire-and-forget)
    db.delete(adminOtps)
      .where(lt(adminOtps.expiresAt, new Date()))
      .then(() => {})
      .catch(() => {});

    // Send SMS
    const msg = `${code} is your Tesmaraneh admin login code. It expires in 10 minutes.`;
    const sent = await sendSms(phone, msg, `admin-otp-${Date.now()}`);
    if (!sent) {
      console.error("[admin login] Failed to send OTP SMS to", phone);
    }

    return NextResponse.json({
      ok: true,
      message: "If this number is registered, a code has been sent.",
    });
  }

  // ─── Step 2: Verify OTP ───
  const otp = body.otp?.trim() ?? "";
  if (!otp || !/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { error: "Invalid code format" },
      { status: 400 }
    );
  }

  // Rate limit per IP
  const ipLimit = rateLimit(`otp-verify:${ip}`, VERIFY_RATE_LIMIT);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  // Rate limit per phone — prevents distributed brute force
  const phoneLimit = rateLimit(
    `otp-verify-phone:${phone}`,
    VERIFY_PHONE_RATE_LIMIT
  );
  if (!phoneLimit.ok) {
    return NextResponse.json(
      { error: "Too many attempts for this number. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(phoneLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  // Find a valid, unused OTP for this phone (compare hashes)
  const hashedOtp = hashOtp(otp, phone);
  const [otpRow] = await db
    .select()
    .from(adminOtps)
    .where(
      and(
        eq(adminOtps.phone, phone),
        eq(adminOtps.code, hashedOtp),
        eq(adminOtps.used, false),
        gt(adminOtps.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!otpRow) {
    return NextResponse.json(
      { error: "Invalid or expired code. Please request a new one." },
      { status: 401 }
    );
  }

  // Mark ALL OTPs for this phone as used (not just this one)
  await db
    .update(adminOtps)
    .set({ used: true })
    .where(eq(adminOtps.phone, phone));

  // Verify admin still exists
  const [admin] = await db
    .select({ id: admins.id, phone: admins.phone })
    .from(admins)
    .where(eq(admins.phone, phone))
    .limit(1);

  if (!admin) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 401 }
    );
  }

  // Update last login
  await db
    .update(admins)
    .set({ lastLoginAt: new Date() })
    .where(eq(admins.id, admin.id));

  // Auto-enroll in SMS notifications on first login (if under the 3-phone cap)
  const existingNotif = await db
    .select({ id: notificationPhones.id })
    .from(notificationPhones)
    .where(eq(notificationPhones.phone, phone))
    .limit(1);

  if (existingNotif.length === 0) {
    const allNotif = await db.select().from(notificationPhones);
    if (allNotif.length < 3) {
      await db
        .insert(notificationPhones)
        .values({ phone, label: "Auto-added on login", addedBy: phone })
        .onConflictDoNothing();
    }
  }

  // Create session
  const token = signSession(admin.phone);
  const res = NextResponse.json({ ok: true, verified: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
