import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

const MAX_ADMINS = 5;

/** POST — add a new admin user */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phone?: string; label?: string };
  try {
    body = (await req.json()) as { phone?: string; label?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rawPhone = body.phone?.trim() ?? "";
  const label = body.label?.trim().slice(0, 40) ?? "";

  if (!rawPhone) {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }

  const phone = normalizePhone(rawPhone);
  if (!phone) {
    return NextResponse.json(
      {
        error:
          "Invalid phone number. Try 23275696192, +23275696192, or 075696192",
      },
      { status: 400 }
    );
  }

  // Check count
  const existing = await db.select().from(admins);
  if (existing.length >= MAX_ADMINS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ADMINS} admin users allowed` },
      { status: 409 }
    );
  }

  // Check duplicate
  if (existing.some((a) => a.phone === phone)) {
    return NextResponse.json(
      { error: "This phone number is already an admin" },
      { status: 409 }
    );
  }

  const [row] = await db
    .insert(admins)
    .values({
      phone,
      label: label || null,
      addedBy: admin.phone,
    })
    .returning();

  return NextResponse.json({ admin: row }, { status: 201 });
}

/** DELETE — remove an admin user by id */
export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Check how many admins exist — don't allow deleting the last one
  const all = await db.select().from(admins);
  if (all.length <= 1) {
    return NextResponse.json(
      { error: "Cannot remove the last admin user" },
      { status: 409 }
    );
  }

  // Don't allow deleting yourself
  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself" },
      { status: 409 }
    );
  }

  await db.delete(admins).where(eq(admins.id, id));

  return NextResponse.json({ ok: true });
}
