"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/wibu/wiki", label: "📖 Wiki" },
  { href: "/wibu/tentang-wibu", label: "ℹ️ Tentang" },
  { href: "/wibu/blog", label: "✍️ Blog" },
];

const FOOTER_LINKS = [
  { href: "/", label: "🏠 Hub" },
  { href: "/wibu", label: "🎌 Beranda Wibu" },
  { href: "/wibu/wiki", label: "📖 Wiki" },
  { href: "/wibu/tentang-wibu", label: "ℹ️ Tentang" },
  { href: "/wibu/blog", label: "✍️ Blog" },
  { href: "/wibu/username", label: "🎮 Mulai Kuis" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 shadow-sm"
        style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-black" style={{ color: "var(--color-primary)" }}>
            🌸 WibuQuiz
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4 text-sm font-semibold">
            <Link
              href="/"
              className="transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Hub
            </Link>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-opacity hover:opacity-70"
                style={{ color: pathname === href ? "var(--color-primary)" : "var(--color-text)" }}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/wibu/username"
              className="px-4 py-2 rounded-full font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Mulai Kuis ✨
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            style={{ backgroundColor: open ? "var(--color-surface-alt)" : "transparent" }}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "var(--color-text-bold)",
                transform: open ? "translateY(8px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "var(--color-text-bold)",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "var(--color-text-bold)",
                transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          style={{ backgroundColor: "rgba(58,58,90,0.35)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 sm:hidden flex flex-col transition-transform duration-300"
        style={{
          width: "72vw",
          maxWidth: "280px",
          backgroundColor: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          boxShadow: open ? "-4px 0 24px rgba(90,90,122,0.15)" : "none",
        }}
        aria-hidden={!open}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span className="text-lg font-black" style={{ color: "var(--color-primary)" }}>
            🌸 WibuQuiz
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-lg font-bold transition-colors hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            style={{ color: "var(--color-text-muted)", backgroundColor: "var(--color-surface-alt)" }}
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        {/* Sidebar links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "var(--color-text-muted)",
            }}
          >
            ← Kembali ke Hub
          </Link>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors"
              style={{
                backgroundColor: pathname === href ? "var(--color-surface-alt)" : "transparent",
                color: pathname === href ? "var(--color-primary)" : "var(--color-text-bold)",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar CTA */}
        <div className="px-4 pb-8">
          <Link
            href="/wibu/username"
            className="block w-full text-center py-3 rounded-2xl font-black text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            🚀 Mulai Kuis Sekarang
          </Link>
        </div>
      </div>
    </>
  );
}

export function PublicFooter() {
  return (
    <footer
      className="py-6 px-4 text-center text-sm"
      style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-bold" style={{ color: "var(--color-primary)" }}>🌸 WibuQuiz</p>
        <div className="flex flex-wrap justify-center gap-4">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:opacity-80 transition-opacity">
              {label}
            </Link>
          ))}
        </div>
        <p>© 2026 WibuQuiz. Made with 💖</p>
      </div>
    </footer>
  );
}
