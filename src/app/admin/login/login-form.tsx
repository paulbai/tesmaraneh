"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Login failed");
      }
      router.replace("/admin/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium tracking-wide uppercase text-stone-500 mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium tracking-wide uppercase text-stone-500 mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 px-4 rounded-lg bg-[var(--terracotta)] hover:bg-[var(--terracotta-dark)] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
