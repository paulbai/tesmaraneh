"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors disabled:opacity-50"
    >
      <LogOut size={14} />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
