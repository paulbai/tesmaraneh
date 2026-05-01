import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";
import type { OrderStatus } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";
import { canTransition, ALL_STATUSES } from "@/lib/order-transitions";

export const runtime = "nodejs";

type PatchBody = {
  status?: OrderStatus;
  note?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const nextStatus = body.status;
  if (!nextStatus || !ALL_STATUSES.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === nextStatus) {
    return NextResponse.json({ ok: true, already: true });
  }

  if (!canTransition(order.status, nextStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition from ${order.status} to ${nextStatus}`,
      },
      { status: 409 }
    );
  }

  await db
    .update(orders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: order.status,
    toStatus: nextStatus,
    changedBy: admin.email,
    note: body.note?.trim() || null,
  });

  return NextResponse.json({ ok: true });
}
