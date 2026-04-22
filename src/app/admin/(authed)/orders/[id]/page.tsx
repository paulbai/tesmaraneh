import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  orderStatusHistory,
} from "@/lib/db/schema";
import {
  ADMIN_TRANSITIONS,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/order-transitions";
import { StatusActions } from "./status-actions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSll(n: number) {
  return `Le ${n.toLocaleString()}`;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) notFound();

  const [items, history] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(asc(orderStatusHistory.createdAt)),
  ]);

  const nextOptions = ADMIN_TRANSITIONS[order.status];

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-stone-900">
            {order.reference}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`self-start inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            STATUS_STYLES[order.status]
          }`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Panel title="Items">
            <div className="divide-y divide-stone-100">
              {items.map((i) => (
                <div key={i.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-900">
                      {i.productName}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 capitalize">
                      {i.productCategory} · {i.productCollection}
                      {i.size ? ` · Size ${i.size}` : ""}
                      {i.color ? ` · ${i.color}` : ""}
                    </div>
                    <div className="text-xs font-mono text-stone-400 mt-0.5">
                      {i.productId}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-stone-900">
                      {formatSll(i.unitPriceSll)}{" "}
                      <span className="text-stone-400">× {i.quantity}</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">
                      {formatSll(i.unitPriceSll * i.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-200 px-5 py-4 bg-stone-50/50 space-y-1.5">
              <Row
                label={`Subtotal (${order.itemCount} ${
                  order.itemCount === 1 ? "item" : "items"
                })`}
                value={formatSll(order.totalSll)}
              />
              <Row
                label="Total (USD equivalent)"
                value={`$${order.totalUsd}`}
                muted
              />
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-bold text-lg text-stone-900">
                  {formatSll(order.totalSll)}
                </span>
              </div>
            </div>
          </Panel>

          {/* History */}
          <Panel title="Status history">
            <ol className="divide-y divide-stone-100">
              {history.map((h) => (
                <li key={h.id} className="px-5 py-3 flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        h.toStatus === "paid" ||
                        h.toStatus === "delivered"
                          ? "bg-emerald-500"
                          : h.toStatus === "cancelled" ||
                            h.toStatus === "failed"
                          ? "bg-rose-500"
                          : "bg-stone-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-stone-900">
                      {h.fromStatus
                        ? `${STATUS_LABELS[h.fromStatus]} → ${
                            STATUS_LABELS[h.toStatus]
                          }`
                        : STATUS_LABELS[h.toStatus]}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {formatDate(h.createdAt)}
                      {h.changedBy ? ` · ${h.changedBy}` : ""}
                    </div>
                    {h.note && (
                      <div className="text-xs text-stone-600 mt-1 italic">
                        {h.note}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* Right column — actions + customer */}
        <div className="space-y-6">
          <Panel title="Actions">
            <div className="p-5">
              {nextOptions.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No further transitions available — this order is in a
                  terminal state.
                </p>
              ) : (
                <StatusActions
                  orderId={order.id}
                  options={nextOptions}
                />
              )}
            </div>
          </Panel>

          <Panel title="Customer">
            <dl className="px-5 py-4 space-y-3 text-sm">
              <Field label="Name" value={order.customerName} />
              <Field label="Phone" value={order.customerPhone} mono />
              <Field label="Address" value={order.customerAddress} />
              <Field label="City" value={order.customerCity} />
            </dl>
          </Panel>

          <Panel title="Payment">
            <dl className="px-5 py-4 space-y-3 text-sm">
              <Field
                label="Flot payment id"
                value={order.flotPaymentId ?? "—"}
                mono
              />
              <Field label="Reference" value={order.reference} mono />
              <Field
                label="Updated"
                value={formatDate(order.updatedAt)}
              />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <header className="px-5 py-3 border-b border-stone-200 bg-stone-50/50">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </h2>
      </header>
      <div>{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={muted ? "text-stone-400" : "text-stone-700"}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-400">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-stone-900 ${
          mono ? "font-mono text-xs break-all" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
