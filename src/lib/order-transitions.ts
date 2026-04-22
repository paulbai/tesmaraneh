import type { OrderStatus } from "@/lib/db/schema";

/** Admin-allowed status transitions. Paid/failed normally arrive via webhook,
 *  but an admin may override manually (e.g. cash payment reconciled). */
export const ADMIN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled", "failed"],
  paid: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  failed: ["pending"],
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending payment",
  paid: "Paid",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Payment failed",
};

/** Tailwind classes for status pills — keyed by status. */
export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-sky-100 text-sky-800 border-sky-200",
  preparing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-violet-100 text-violet-800 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-stone-100 text-stone-700 border-stone-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
};

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];

export function canTransition(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ADMIN_TRANSITIONS[from].includes(to);
}
