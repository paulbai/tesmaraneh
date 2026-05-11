"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, step: "request" }),
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
        body: JSON.stringify({ phone, otp: code, step: "verify" }),
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
        body: JSON.stringify({ phone, step: "request" }),
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
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newOtp.every((d) => d !== "")) {
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
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === 6) {
      setTimeout(() => verifyOtp(), 150);
    }
  }

  // Format phone for display
  function displayPhone(p: string): string {
    const cleaned = p.replace(/[\s\-()]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    if (cleaned.startsWith("232")) return `+${cleaned}`;
    return cleaned;
  }

  // ─── Step 1: Enter phone ───
  if (step === "phone") {
    return (
      <form onSubmit={requestOtp} className="space-y-5">
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-medium tracking-wide uppercase text-stone-500 mb-1.5"
          >
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +23275696192"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 font-mono placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/40 focus:border-[var(--terracotta)] transition-all"
          />
          <p className="text-xs text-stone-400 mt-1.5">
            Include country code for best results (e.g. +23275696192)
          </p>
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
        <p className="text-sm text-stone-600">We sent a 6-digit code to</p>
        <p className="text-sm font-semibold font-mono text-stone-900 mt-0.5">
          {displayPhone(phone)}
        </p>
        <button
          onClick={() => {
            setStep("phone");
            setOtp(["", "", "", "", "", ""]);
            setError(null);
          }}
          className="text-xs text-[var(--terracotta)] hover:underline mt-1"
        >
          Change number
        </button>
      </div>

      {/* OTP input boxes */}
      <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
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
