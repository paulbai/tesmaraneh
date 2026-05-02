import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory } from "@/lib/db/schema";
import { getProductById } from "@/lib/products";

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

export async function POST(req: NextRequest) {
  let body: PostOrderBody;
  try {
    body = (await req.json()) as PostOrderBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // ─── Validate customer ───
  const c = body.customer ?? ({} as PostOrderBody["customer"]);
  const missing = ["name", "phone", "address", "city"].filter(
    (k) => !(c as Record<string, string | undefined>)[k]?.trim()
  );
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing customer fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }
  if (c.phone.replace(/\D/g, "").length < 8) {
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
    const product = getProductById(line.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product: ${line.productId}` },
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
      size: line.size?.trim() || null,
      color: line.color?.trim() || null,
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
        customerName: c.name.trim(),
        customerPhone: c.phone.trim(),
        customerAddress: c.address.trim(),
        customerCity: c.city.trim(),
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
