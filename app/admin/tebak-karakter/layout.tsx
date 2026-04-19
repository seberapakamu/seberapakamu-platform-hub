import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const TEBAK_NAV = [
  { href: "/admin/tebak-karakter/characters", label: "🎭 Karakter" },
  { href: "/admin/tebak-karakter/config", label: "⚙️ Konfigurasi" },
];

export default function TebakKarakterAdminLayout({
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
              🎭 Tebak Karakter Anime
            </span>
          </div>

          {/* Right: logout */}
          <div className="flex items-center gap-2">
            <AdminLogoutButton />
          </div>
        </div>

        {/* Horizontal nav */}
        <nav
          className="max-w-5xl mx-auto mt-2 flex flex-wrap gap-1"
          aria-label="Navigasi panel Tebak Karakter"
        >
          {TEBAK_NAV.map(({ href, label }) => (
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
