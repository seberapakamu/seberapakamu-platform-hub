"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

const STORAGE_KEY = "admin_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

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
      saveAttemptData({ count: 0, lockedUntil: null });
      setLocked(false);
    }
  }, []);

  useEffect(() => {
    checkLockout();
  }, [checkLockout]);

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
    saveAttemptData({ count: 0, lockedUntil: null });
    router.push("/admin");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "#0F0F1A",
        color: "#F0F0FF",
        fontFamily: "var(--font-nunito), 'Nunito', Arial, sans-serif",
      }}
    >
      <style>{`
        .admin-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          font-size: 1rem;
          font-weight: 600;
          background: #0F0F1A;
          color: #F0F0FF;
          border: 2px solid #2A2A45;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .admin-input::placeholder { color: #4A4A6A; }
        .admin-input:focus { border-color: #FF9A9E; }
        .admin-input:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-input.error { border-color: #C0394A; }
        .login-btn {
          width: 100%;
          padding: 0.875rem;
          border-radius: 0.625rem;
          font-size: 1rem;
          font-weight: 900;
          color: #0F0F1A;
          background: #FF9A9E;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.2s ease, transform 0.15s ease, opacity 0.15s;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 20px #FF9A9E66, 0 0 40px #FF9A9E33;
          transform: translateY(-2px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#1A1A2E",
          border: "2px solid #FF9A9E",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 0 40px #FF9A9E22",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.75rem" }} aria-hidden="true">
            🔐
          </div>
          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.75rem",
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            Admin Login
          </h1>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#9090B0" }}>
            Selamat datang kembali, admin-chan~ 🌸
          </p>
        </div>

        {/* Lockout banner */}
        {locked && (
          <div
            role="alert"
            style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              textAlign: "center",
              background: "rgba(192,57,74,0.15)",
              border: "1px solid #C0394A",
              color: "#FF6B7A",
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
            style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              textAlign: "center",
              background: "rgba(192,57,74,0.15)",
              border: "1px solid #C0394A",
              color: "#FF6B7A",
            }}
          >
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#F0F0FF",
                marginBottom: "0.5rem",
              }}
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
              className={`admin-input${fieldErrors.email ? " error" : ""}`}
            />
            {fieldErrors.email && (
              <p
                id="email-error"
                role="alert"
                style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", fontWeight: 700, color: "#FF6B7A" }}
              >
                ⚠️ {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#F0F0FF",
                marginBottom: "0.5rem",
              }}
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
              className={`admin-input${fieldErrors.password ? " error" : ""}`}
            />
            {fieldErrors.password && (
              <p
                id="password-error"
                role="alert"
                style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", fontWeight: 700, color: "#FF6B7A" }}
              >
                ⚠️ {fieldErrors.password}
              </p>
            )}
          </div>

          <button type="submit" disabled={locked || loading} className="login-btn">
            {loading ? "Memproses..." : "Masuk 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
