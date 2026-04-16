"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

const STORAGE_KEY = "admin_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

interface AttemptData {
  count: number;
  lockedUntil: number | null;
}

function getAttemptData(): AttemptData {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw) as AttemptData;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttemptData(data: AttemptData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getRemainingMinutes(lockedUntil: number): number {
  return Math.ceil((lockedUntil - Date.now()) / 60000);
}

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const checkLockout = useCallback(() => {
    const data = getAttemptData();
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      setLocked(true);
      setCountdown(getRemainingMinutes(data.lockedUntil));
    } else if (data.lockedUntil && data.lockedUntil <= Date.now()) {
      // Lockout expired — reset
      saveAttemptData({ count: 0, lockedUntil: null });
      setLocked(false);
    }
  }, []);

  useEffect(() => {
    checkLockout();
  }, [checkLockout]);

  // Countdown ticker
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      const data = getAttemptData();
      if (!data.lockedUntil || data.lockedUntil <= Date.now()) {
        saveAttemptData({ count: 0, lockedUntil: null });
        setLocked(false);
        clearInterval(interval);
      } else {
        setCountdown(getRemainingMinutes(data.lockedUntil));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [locked]);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Format email tidak valid";
    }
    if (!password) {
      errors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      const data = getAttemptData();
      const newCount = data.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION;
        saveAttemptData({ count: newCount, lockedUntil });
        setLocked(true);
        setCountdown(getRemainingMinutes(lockedUntil));
      } else {
        saveAttemptData({ count: newCount, lockedUntil: null });
        setAuthError("Email atau password salah.");
      }
      return;
    }

    // Success — reset counter and redirect
    saveAttemptData({ count: 0, lockedUntil: null });
    router.push("/admin/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-md rounded-3xl shadow-lg p-8 sm:p-10"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3" aria-hidden="true">🔐</div>
          <h1
            className="text-2xl sm:text-3xl font-black mb-2"
            style={{ color: "var(--color-text-bold)" }}
          >
            Admin Login
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Selamat datang kembali, admin-chan~ 🌸
          </p>
        </div>

        {/* Lockout banner */}
        {locked && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-2xl text-sm font-semibold text-center"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            🔒 Terlalu banyak percobaan. Coba lagi dalam{" "}
            <strong>{countdown} menit</strong>.
          </div>
        )}

        {/* Auth error */}
        {authError && !locked && (
          <div
            role="alert"
            className="mb-6 px-4 py-3 rounded-2xl text-sm font-semibold text-center"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={locked || loading}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              aria-invalid={!!fieldErrors.email}
              className="w-full px-4 py-3 rounded-2xl text-base font-semibold outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-bg)",
                border: `2px solid ${fieldErrors.email ? "var(--color-error)" : "var(--color-border)"}`,
                color: "var(--color-text-bold)",
              }}
              onFocus={(e) => {
                if (!fieldErrors.email) e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                if (!fieldErrors.email) e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1 text-xs font-bold"
                style={{ color: "var(--color-error)" }}
              >
                ⚠️ {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-7">
            <label
              htmlFor="password"
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={locked || loading}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              aria-invalid={!!fieldErrors.password}
              className="w-full px-4 py-3 rounded-2xl text-base font-semibold outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-bg)",
                border: `2px solid ${fieldErrors.password ? "var(--color-error)" : "var(--color-border)"}`,
                color: "var(--color-text-bold)",
              }}
              onFocus={(e) => {
                if (!fieldErrors.password) e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                if (!fieldErrors.password) e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
            {fieldErrors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1 text-xs font-bold"
                style={{ color: "var(--color-error)" }}
              >
                ⚠️ {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={locked || loading}
            className="w-full py-4 rounded-2xl text-base font-black text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading ? "Memproses..." : "Masuk 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
