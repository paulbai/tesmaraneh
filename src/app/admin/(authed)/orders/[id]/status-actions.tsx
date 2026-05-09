"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/db/schema";
import { STATUS_LABELS } from "@/lib/order-transitions";

export function StatusActions({
  orderId,
  options,
}: {
  orderId: string;
  options: OrderStatus[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function transition(next: OrderStatus) {
    const needsConfirm = next === "cancelled" || next === "failed";
    if (
      needsConfirm &&
      !confirm(`Mark this order as ${STATUS_LABELS[next]}? This is logged.`)
    ) {
      return;
    }
    setError(null);
    setBusy(next);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Update failed");
      }
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Note (optional)
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Customer confirmed by phone"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
        />
      </label>

      <div className="flex flex-col gap-2">
        {options.map((s) => (
          <button
            key={s}
            onClick={() => transition(s)}
            disabled={busy !== null}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              s === "cancelled" || s === "failed"
                ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                : s === "delivered" || s === "paid"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-stone-900 text-white hover:bg-stone-700"
            }`}
          >
            {busy === s
              ? "Updating…"
              : `Mark as ${STATUS_LABELS[s]}`}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}
