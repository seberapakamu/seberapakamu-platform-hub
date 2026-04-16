"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function validateUsername(value: string): string | null {
  if (value.trim().length === 0) {
    return "Username wajib diisi";
  }
  if (value.length > 30) {
    return "Username maksimal 30 karakter";
  }
  // Reject HTML tags / script injection characters
  if (/[<>"'&/\\]/.test(value)) {
    return "Username mengandung karakter tidak valid";
  }
  return null;
}

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }
    localStorage.setItem("wibu_username", username.trim());
    router.push("/wibu/quiz");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
    if (error) setError(null);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/wibu"
            className="text-xl font-black"
            style={{ color: "var(--color-primary)" }}
          >
            🌸 WibuQuiz
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
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
            <div className="text-5xl mb-3" aria-hidden="true">✏️</div>
            <h1
              className="text-2xl sm:text-3xl font-black mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              Siapa namamu?
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              Masukkan username biar kartu hasilmu makin personal! 🌸
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--color-text-bold)" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Contoh: SepuhWibu99"
                maxLength={31}
                autoComplete="off"
                autoFocus
                aria-describedby={error ? "username-error" : undefined}
                aria-invalid={error ? "true" : "false"}
                className="w-full px-4 py-3 rounded-2xl text-base font-semibold outline-none transition-all"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: `2px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
                  color: "var(--color-text-bold)",
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }
                }}
              />

              {/* Character counter */}
              <div className="flex justify-between items-center mt-1">
                <div>
                  {error && (
                    <p
                      id="username-error"
                      role="alert"
                      className="text-xs font-bold"
                      style={{ color: "var(--color-error)" }}
                    >
                      ⚠️ {error}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color:
                      username.length > 30
                        ? "var(--color-error)"
                        : "var(--color-text-muted)",
                  }}
                >
                  {username.length}/30
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-base font-black text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Lanjut ke Kuis 🚀
            </button>
          </form>

          {/* Footer hint */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            Username hanya digunakan untuk kartu hasil. Tidak perlu daftar! 🎉
          </p>
        </div>
      </main>
    </div>
  );
}
