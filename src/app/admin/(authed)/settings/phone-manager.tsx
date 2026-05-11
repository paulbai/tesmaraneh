"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Plus, Trash2 } from "lucide-react";
import type { NotificationPhone } from "@/lib/db/schema";

const MAX_PHONES = 3;

export function PhoneManager({
  initialPhones,
}: {
  initialPhones: NotificationPhone[];
}) {
  const router = useRouter();
  const [phones, setPhones] = useState(initialPhones);
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function addPhone(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), label: label.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to add number");
      }

      const data = (await res.json()) as { phone: NotificationPhone };
      setPhones((prev) => [...prev, data.phone]);
      setPhone("");
      setLabel("");
      setSuccess("Phone number added successfully");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add number");
    } finally {
      setBusy(false);
    }
  }

  async function removePhone(id: string) {
    setError(null);
    setSuccess(null);
    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/settings?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove number");
      }

      setPhones((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Phone number removed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing phones */}
      {phones.length > 0 && (
        <div className="space-y-2">
          {phones.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-stone-50 border border-stone-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Phone size={16} className="text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm text-stone-900">
                    +{p.phone}
                  </div>
                  {p.label && (
                    <div className="text-xs text-stone-500">{p.label}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removePhone(p.id)}
                disabled={deleting === p.id}
                className="shrink-0 p-2 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                title="Remove number"
              >
                {deleting === p.id ? (
                  <span className="text-xs">...</span>
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {phones.length === 0 && (
        <div className="text-sm text-stone-500 py-2">
          No notification numbers configured. Add a phone number below to
          receive SMS alerts when orders come in.
        </div>
      )}

      {/* Add form */}
      {phones.length < MAX_PHONES && (
        <form onSubmit={addPhone} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +23275696192"
              required
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (optional, e.g. Owner)"
              className="sm:w-48 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
            />
            <button
              type="submit"
              disabled={busy || !phone.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus size={14} />
              {busy ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      )}

      {phones.length >= MAX_PHONES && (
        <p className="text-xs text-stone-500">
          Maximum of {MAX_PHONES} notification numbers reached. Remove one to
          add a different number.
        </p>
      )}

      {/* Feedback */}
      {error && (
        <p
          role="alert"
          className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </div>
  );
}
