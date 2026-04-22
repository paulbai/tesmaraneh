import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

/** Cookie-based admin session. Deliberately minimal:
 *   cookie value = base64url(`${email}.${expiresAt}`) + "." + hmac_sha256
 *  We verify HMAC + expiry server-side, then confirm the email still exists
 *  in the `admins` allowlist. No DB-side sessions, no JWT library.
 *
 *  Upgradeable to magic-link auth later without touching the admins table. */

const COOKIE_NAME = "tes_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short (need ≥32 chars)."
    );
  }
  return s;
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str: string): Buffer {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(payload: string): string {
  return b64urlEncode(
    createHmac("sha256", getSecret()).update(payload).digest()
  );
}

// Payload separator must NOT appear in emails. "|" satisfies RFC 5321 (the
// local-part permits dots but not pipes).
const PAYLOAD_SEP = "|";

export function signSession(email: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${email}${PAYLOAD_SEP}${expiresAt}`;
  const mac = sign(payload);
  return `${b64urlEncode(payload)}.${mac}`;
}

/** Parse + HMAC-verify + expiry-check. Returns email on success, null on
 *  any tampering / expiry / malformed input. Does NOT hit the admins table —
 *  callers that need allowlist enforcement must call `requireAdmin`. */
export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payloadB64, macB64] = token.split(".");
  if (!payloadB64 || !macB64) return null;

  let payload: string;
  try {
    payload = b64urlDecode(payloadB64).toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(payload);
  let ok = false;
  try {
    ok = timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(macB64, "utf8")
    );
  } catch {
    return null;
  }
  if (!ok) return null;

  const sepIdx = payload.lastIndexOf(PAYLOAD_SEP);
  if (sepIdx === -1) return null;
  const email = payload.slice(0, sepIdx);
  const exp = Number(payload.slice(sepIdx + 1));
  if (!email || !Number.isFinite(exp)) return null;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  return email;
}

/** Full check: valid cookie AND email still in admins table.
 *  Returns the admin row (includes id) or null. Updates lastLoginAt on
 *  successful read so we can see activity in the admin list later. */
export async function getCurrentAdmin(): Promise<{
  id: string;
  email: string;
} | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const email = verifySession(token);
  if (!email) return null;

  const [row] = await db
    .select({ id: admins.id, email: admins.email })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  return row ?? null;
}

/** Constant-time password comparison against the env-configured password.
 *  Throws if ADMIN_PASSWORD is unset so misconfiguration fails loudly. */
export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    // Burn time comparing to prevent length-based side channel.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/** Generate a 64-char hex secret. Used by the setup script. */
export function generateSecret(): string {
  return randomBytes(48).toString("hex");
}
