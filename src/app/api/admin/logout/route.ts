import { NextResponse } from "next/server";
import { SESSION_COOKIE, getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  // Verify the caller is actually authenticated before clearing
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}
