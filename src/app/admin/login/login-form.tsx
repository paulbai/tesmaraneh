"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input when step changes to otp
  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, step: "request" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? "Failed to send code");
      }
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, step: "verify" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        verified?: boolean;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Verification failed");
      }
      if (data.verified) {
        router.replace("/admin/orders");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (resendCooldown > 0) return;
    setError(null);
    setSubmitting(true);
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, step: "request" }),
      });
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend code");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      // Small delay so the user sees the last digit fill in
      setTimeout(() => verifyOtp(), 150);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if all 6
    if (pasted.length === 6) {
      setTimeout(() => {
        setOtp(newOtp);
        verifyOtp();
      }, 150);
    }
  }

  // ─── Step 1: Enter email ───
  if (step === "email") {
    return (
      <form onSubmit={requestOtp} className="space-y-5">
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
          {submitting ? "Sending code…" : "Send login code"}
        </button>
      </form>
    );
  }

  // ─── Step 2: Enter OTP ───
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-stone-600">
          We sent a 6-digit code to
        </p>
        <p className="text-sm font-semibold text-stone-900 mt-0.5">{email}</p>
        <button
          onClick={() => {
            setStep("email");
            setOtp(["", "", "", "", "", ""]);
            setError(null);
          }}
          className="text-xs text-[var(--terracotta)] hover:underline mt-1"
        >
          Change email
        </button>
      </div>

      {/* OTP input boxes */}
      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            disabled={submitting}
            className="w-11 h-13 text-center text-xl font-mono font-bold rounded-lg border-2 border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all disabled:opacity-50"
          />
        ))}
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
        onClick={verifyOtp}
        disabled={submitting || otp.some((d) => !d)}
        className="w-full py-2.5 px-4 rounded-lg bg-[var(--terracotta)] hover:bg-[var(--terracotta-dark)] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Verifying…" : "Verify & sign in"}
      </button>

      <div className="text-center">
        <button
          onClick={resendCode}
          disabled={resendCooldown > 0 || submitting}
          className="text-xs text-stone-500 hover:text-stone-900 disabled:text-stone-300 transition-colors"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </button>
      </div>
    </div>
  );
}
