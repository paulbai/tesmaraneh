import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import type { OrderStatus } from "@/lib/db/schema";
import {
  ALL_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/order-transitions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status && ALL_STATUSES.includes(sp.status as OrderStatus)
      ? (sp.status as OrderStatus)
      : null;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (statusFilter) conditions.push(eq(orders.status, statusFilter));
  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        ilike(orders.reference, like),
        ilike(orders.customerPhone, like),
        ilike(orders.customerName, like)
      )!
    );
  }
  const where =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(where),
  ]);

  const totalCount = countRows[0]?.c ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build a query-string helper that preserves current filters.
  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    const s = params.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {totalCount.toLocaleString()} total
            {statusFilter ? ` · ${STATUS_LABELS[statusFilter]}` : ""}
            {q ? ` · matching "${q}"` : ""}
          </p>
        </div>

        <form
          action="/admin/orders"
          method="get"
          className="flex items-center gap-2"
        >
          {statusFilter && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search reference, name, phone…"
            className="w-full sm:w-72 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          href={buildHref({ status: undefined, page: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !statusFilter
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={buildHref({ status: s, page: undefined })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-stone-500 text-sm">
            No orders match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <Th>Reference</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th align="right">Items</Th>
                  <Th align="right">Total</Th>
                  <Th>Placed</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-stone-50/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs text-stone-900 hover:text-[var(--terracotta)]"
                      >
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-stone-900 truncate max-w-[200px]">
                        {o.customerName}
                      </div>
                      <div className="text-xs text-stone-500">
                        {o.customerPhone} · {o.customerCity}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_STYLES[o.status]
                        }`}
                      >
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-stone-600">
                      {o.itemCount}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-stone-900">
                      {formatSll(o.totalSll)}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-stone-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <PageLink
              href={buildHref({
                page: page > 1 ? String(page - 1) : undefined,
              })}
              disabled={page <= 1}
            >
              Previous
            </PageLink>
            <PageLink
              href={buildHref({
                page: page < totalPages ? String(page + 1) : undefined,
              })}
              disabled={page >= totalPages}
            >
              Next
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-300 text-sm cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 text-sm hover:bg-stone-100 transition-colors"
    >
      {children}
    </Link>
  );
}
