import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { MODULES } from "@/lib/modules.config";

const WIBU_NAV = [
  { href: "/admin/wibu", label: "📊 Dashboard" },
  { href: "/admin/wibu/questions", label: "📝 Pertanyaan" },
  { href: "/admin/wibu/content", label: "📚 Konten Blog" },
  { href: "/admin/wibu/site-content", label: "✏️ Edit Halaman" },
];

const otherActiveModules = MODULES.filter(
  (m) => m.status === "active" && m.slug !== "wibu"
);

export default function WibuPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "var(--color-bg)" }} className="min-h-screen">
      {/* Panel Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: back link + module name */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Pilih Modul
            </Link>
            <span style={{ color: "var(--color-border)" }}>|</span>
            <span
              className="text-sm font-black"
              style={{ color: "var(--color-text-bold)" }}
            >
              🌸 Seberapa Wibu Kamu?
            </span>
          </div>

          {/* Right: other active module shortcuts + logout */}
          <div className="flex items-center gap-2">
            {otherActiveModules.map((m) => (
              <Link
                key={m.slug}
                href={`/admin/${m.slug}`}
                className="text-xs font-bold px-3 py-1.5 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                {m.mascotEmoji} {m.name}
              </Link>
            ))}
            <AdminLogoutButton />
          </div>
        </div>

        {/* Horizontal nav */}
        <nav
          className="max-w-5xl mx-auto mt-2 flex flex-wrap gap-1"
          aria-label="Navigasi panel Wibu"
        >
          {WIBU_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-1.5 rounded-2xl text-sm font-bold transition-colors hover:opacity-80"
              style={{
                color: "var(--color-text-bold)",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
