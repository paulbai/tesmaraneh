import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationPhones } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_PHONES = 3;

/** GET — list all notification phones */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phones = await db.select().from(notificationPhones);
  return NextResponse.json({ phones });
}

/** POST — add a notification phone */
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

  // Normalize: strip spaces, dashes, parentheses. Keep leading +.
  let phone = rawPhone.replace(/[\s\-()]/g, "");

  // If starts with +, strip the +
  if (phone.startsWith("+")) {
    phone = phone.slice(1);
  }

  // Must be digits only and reasonable length (8-15 digits per E.164)
  if (!/^\d{8,15}$/.test(phone)) {
    return NextResponse.json(
      {
        error:
          "Invalid phone number. Use full international format, e.g. 23230123456",
      },
      { status: 400 }
    );
  }

  // Check count
  const existing = await db.select().from(notificationPhones);
  if (existing.length >= MAX_PHONES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PHONES} notification numbers allowed` },
      { status: 409 }
    );
  }

  // Check duplicate
  if (existing.some((p) => p.phone === phone)) {
    return NextResponse.json(
      { error: "This number is already added" },
      { status: 409 }
    );
  }

  const [row] = await db
    .insert(notificationPhones)
    .values({
      phone,
      label: label || null,
      addedBy: admin.email,
    })
    .returning();

  return NextResponse.json({ phone: row }, { status: 201 });
}

/** DELETE — remove a notification phone by id */
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

  await db
    .delete(notificationPhones)
    .where(eq(notificationPhones.id, id));

  return NextResponse.json({ ok: true });
}
