import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory } from "@/lib/db/schema";
import { getProductById } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Runs on Node — needs pg driver, not Edge. */
export const runtime = "nodejs";

type PostOrderBody = {
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    size?: string | null;
    color?: string | null;
  }>;
};

// Hard caps on the customer fields. Going much higher costs us nothing
// in normal operation but lets an attacker write 1MB rows.
const MAX_NAME = 120;
const MAX_PHONE = 32;
const MAX_ADDRESS = 300;
const MAX_CITY = 80;
const MAX_VARIANT = 80; // size / color from the cart

// Hard cap on the JSON body. The Next default is generous; we tighten it
// here so a single attacker can't ship a multi-MB payload and chew memory.
// Customer fields + 50 lines × ~600 bytes per line ≈ 30 KB worst case.
const MAX_BODY_BYTES = 64 * 1024;

const RATE_LIMIT_CFG = {
  capacity: 8, // burst allowance
  refillTokens: 8,
  windowMs: 10 * 60_000, // 8 orders / 10 minutes / IP
};

/** Mirror of formatPrice / toSLL from lib/products + cart-drawer. Must stay
 *  in sync — this is the price we actually commit to the order. */
const toSLL = (usd: number) => Math.round((usd * 22) / 10) * 10;

function generateReference() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  // Crockford base32-ish: nanoid without look-alike chars, uppercase.
  return `TES-${yyyy}${mm}${dd}-${nanoid(6).toUpperCase()}`;
}

function clamp(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  // ─── Rate limit (per IP) ───
  const limit = rateLimit(`orders:${clientIp(req)}`, RATE_LIMIT_CFG);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many orders. Please try again in a few minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      }
    );
  }

  // ─── Reject oversized payloads outright ───
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  let body: PostOrderBody;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }
    body = JSON.parse(raw) as PostOrderBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // ─── Validate + clamp customer ───
  const c = body.customer ?? ({} as PostOrderBody["customer"]);
  const customer = {
    name: clamp(c.name, MAX_NAME),
    phone: clamp(c.phone, MAX_PHONE),
    address: clamp(c.address, MAX_ADDRESS),
    city: clamp(c.city, MAX_CITY),
  };
  const missing = (
    Object.keys(customer) as (keyof typeof customer)[]
  ).filter((k) => !customer[k]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing customer fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }
  if (customer.phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { error: "Invalid phone number" },
      { status: 400 }
    );
  }

  // ─── Validate cart ───
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (body.items.length > 50) {
    return NextResponse.json(
      { error: "Too many line items" },
      { status: 400 }
    );
  }

  // Re-price every item server-side from the canonical product catalog
  // and reject anything from the sold-out archive. Never trust the client.
  const resolved = [];
  for (const line of body.items) {
    // Defensive: line.productId is user input and could be any value.
    if (typeof line?.productId !== "string" || line.productId.length > 80) {
      return NextResponse.json(
        { error: "Invalid item in cart" },
        { status: 400 }
      );
    }
    const product = getProductById(line.productId);
    if (!product) {
      // Generic message — never echo the user-supplied id back. That ID
      // could be anything (newlines, ANSI, JSON-breaking chars) and would
      // muddy logs / admin UIs that display this error verbatim.
      return NextResponse.json(
        { error: "Cart contains an unknown item. Please refresh the page." },
        { status: 400 }
      );
    }
    if (!product.inStock) {
      return NextResponse.json(
        {
          error: `${product.name} is sold out. Please remove it from your cart.`,
        },
        { status: 409 }
      );
    }
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity ?? 1)));
    resolved.push({
      product,
      quantity: qty,
      size: clamp(line.size ?? "", MAX_VARIANT) || null,
      color: clamp(line.color ?? "", MAX_VARIANT) || null,
      unitPriceSll: toSLL(product.priceUSD),
      unitPriceUsd: product.priceUSD,
    });
  }

  const totalUsd = resolved.reduce(
    (s, r) => s + r.unitPriceUsd * r.quantity,
    0
  );
  const totalSll = resolved.reduce(
    (s, r) => s + r.unitPriceSll * r.quantity,
    0
  );
  const itemCount = resolved.reduce((s, r) => s + r.quantity, 0);

  const reference = generateReference();

  try {
    const [order] = await db
      .insert(orders)
      .values({
        reference,
        status: "pending",
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCity: customer.city,
        totalSll,
        totalUsd,
        itemCount,
      })
      .returning();

    await db.insert(orderItems).values(
      resolved.map((r) => ({
        orderId: order.id,
        productId: r.product.id,
        productName: r.product.name,
        productCategory: r.product.category,
        productCollection: r.product.collection,
        size: r.size,
        color: r.color,
        quantity: r.quantity,
        unitPriceSll: r.unitPriceSll,
        unitPriceUsd: r.unitPriceUsd,
      }))
    );

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "pending",
      changedBy: "system",
      note: "Order created from checkout",
    });

    return NextResponse.json({
      reference,
      orderId: order.id,
      totalSll,
      totalUsd,
      itemCount,
    });
  } catch (err) {
    console.error("[POST /api/orders] db write failed:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
