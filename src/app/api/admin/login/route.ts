import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { admins, adminOtps } from "@/lib/db/schema";
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

/** Generate a 6-digit numeric OTP. */
function generateOtp(): string {
  return String(randomInt(100000, 999999));
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

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Store OTP
    await db.insert(adminOtps).values({
      phone,
      code,
      expiresAt,
    });

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

  const limit = rateLimit(`otp-verify:${ip}`, VERIFY_RATE_LIMIT);
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

  // Find a valid, unused OTP for this phone
  const [otpRow] = await db
    .select()
    .from(adminOtps)
    .where(
      and(
        eq(adminOtps.phone, phone),
        eq(adminOtps.code, otp),
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

  // Mark OTP as used
  await db
    .update(adminOtps)
    .set({ used: true })
    .where(eq(adminOtps.id, otpRow.id));

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

  // Create session
  const token = signSession(admin.phone);
  const res = NextResponse.json({ ok: true, verified: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
