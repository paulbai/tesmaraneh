"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Plus, Shield, Trash2 } from "lucide-react";

type Admin = {
  id: string;
  phone: string;
  label: string | null;
  email: string | null;
  addedBy: string | null;
  addedAt: Date;
  lastLoginAt: Date | null;
};

const MAX_ADMINS = 5;

export function AdminManager({ initialAdmins }: { initialAdmins: Admin[] }) {
  const router = useRouter();
  const [adminList, setAdminList] = useState(initialAdmins);
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setError(null);
    setSuccess(null);
    setBusy(true);

    try {
      const res = await fetch("/api/admin/settings/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), label: label.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to add admin");
      }

      const data = (await res.json()) as { admin: Admin };
      setAdminList((prev) => [...prev, data.admin]);
      setPhone("");
      setLabel("");
      setSuccess("Admin user added");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setBusy(false);
    }
  }

  async function removeAdmin(id: string) {
    setError(null);
    setSuccess(null);
    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/settings/admins?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to remove admin");
      }

      setAdminList((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Admin user removed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing admins */}
      {adminList.length > 0 && (
        <div className="space-y-2">
          {adminList.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-stone-50 border border-stone-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Shield size={16} className="text-[var(--terracotta)] shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm text-stone-900">
                    +{a.phone}
                  </div>
                  <div className="text-xs text-stone-500">
                    {a.label ?? "Admin"}
                    {a.lastLoginAt
                      ? ` · Last login: ${new Date(a.lastLoginAt).toLocaleDateString()}`
                      : " · Never logged in"}
                  </div>
                </div>
              </div>
              {adminList.length > 1 && (
                <button
                  onClick={() => removeAdmin(a.id)}
                  disabled={deleting === a.id}
                  className="shrink-0 p-2 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Remove admin"
                >
                  {deleting === a.id ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adminList.length < MAX_ADMINS && (
        <form onSubmit={addAdmin} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 075696192"
              required
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Name (e.g. Isatu)"
              className="sm:w-48 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
            />
            <button
              type="submit"
              disabled={busy || !phone.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus size={14} />
              {busy ? "Adding..." : "Add admin"}
            </button>
          </div>
        </form>
      )}

      {adminList.length >= MAX_ADMINS && (
        <p className="text-xs text-stone-500">
          Maximum of {MAX_ADMINS} admin users reached.
        </p>
      )}

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
