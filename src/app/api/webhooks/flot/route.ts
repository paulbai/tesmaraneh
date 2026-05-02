import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@/lib/db/schema";

/** Flot checkout webhook. Flow:
 *    1. Flot POSTs to this URL when a payment settles (or fails).
 *    2. We verify the HMAC signature against FLOT_WEBHOOK_SECRET.
 *    3. We look up the order by `reference` and flip status to `paid`
 *       (or `failed`), stamping the payment id.
 *
 *  The exact payload shape + signature header name are placeholders — replace
 *  once we have Flot's webhook docs. The handler is written defensively so
 *  that plugging in the real values is a one-line change.
 */

export const runtime = "nodejs";

// Payload fields we care about. Everything else is ignored.
type FlotWebhookPayload = {
  event: "payment.succeeded" | "payment.failed" | string;
  reference: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
};

function verifySignature(raw: string, signature: string | null): boolean {
  const secret = process.env.FLOT_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured yet → deny until we have one.
    return false;
  }
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature =
    req.headers.get("x-flot-signature") ?? req.headers.get("x-signature");

  if (!verifySignature(raw, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: FlotWebhookPayload;
  try {
    payload = JSON.parse(raw) as FlotWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!payload.reference) {
    return NextResponse.json(
      { error: "Missing reference" },
      { status: 400 }
    );
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.reference, payload.reference))
    .limit(1);

  if (!order) {
    // Ack with 200 — we don't want Flot to keep retrying a webhook for an
    // order we can't find. JSON.stringify the reference so a hostile or
    // malformed value can't inject newlines / ANSI / log-poisoning chars.
    console.warn(
      "[flot webhook] reference not found:",
      JSON.stringify(payload.reference)
    );
    return NextResponse.json({ ok: true });
  }

  const nextStatus =
    payload.event === "payment.succeeded"
      ? "paid"
      : payload.event === "payment.failed"
      ? "failed"
      : null;

  if (!nextStatus) {
    // Unknown event — ignore.
    return NextResponse.json({ ok: true });
  }

  // Idempotency — if we've already processed this, no-op.
  if (order.status === nextStatus) {
    return NextResponse.json({ ok: true, already: true });
  }

  // Refuse to clobber terminal states. A delayed retry of a stale
  // payment.succeeded webhook (or a captured-and-replayed one) would
  // otherwise revert a `delivered` or `cancelled` order. The webhook only
  // owns the pending → paid/failed edge.
  const terminal = order.status !== "pending";
  if (terminal) {
    console.warn(
      "[flot webhook] refusing to overwrite non-pending status",
      JSON.stringify({
        reference: payload.reference,
        currentStatus: order.status,
        attemptedStatus: nextStatus,
      })
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  await db
    .update(orders)
    .set({
      status: nextStatus,
      flotPaymentId: payload.payment_id ?? order.flotPaymentId,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    fromStatus: order.status,
    toStatus: nextStatus,
    changedBy: "flot-webhook",
    // Defensive: payload.event / payment_id come from a verified-signed
    // payload so they're attacker-bounded (Flot signs them), but we still
    // truncate to avoid an over-long event string ballooning the row.
    note: `event=${String(payload.event).slice(0, 60)} payment_id=${String(
      payload.payment_id ?? "?"
    ).slice(0, 80)}`,
  });

  return NextResponse.json({ ok: true });
}
