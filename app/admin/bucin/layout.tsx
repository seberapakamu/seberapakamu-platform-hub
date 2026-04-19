import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { MODULES } from "@/lib/modules.config";

const BUCIN_NAV = [
  { href: "/admin/bucin", label: "📊 Dashboard" },
  { href: "/admin/bucin/questions", label: "📝 Pertanyaan" },
  { href: "/admin/bucin/content", label: "📚 Konten Blog" },
  { href: "/admin/bucin/site-content", label: "✏️ Edit Halaman" },
];

const otherActiveModules = MODULES.filter(
  (m) => m.status === "active" && m.slug !== "bucin"
);

export default function BucinPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bucin-admin-theme">
      {/* Bucin-specific CSS variable overrides — deep crimson/rose love theme */}
      <style>{`
        .bucin-admin-theme {
          --color-primary:     #E11D48;
          --color-primary-dark:#BE123C;
          --color-secondary:   #FFF1F2;
          --color-accent:      #9F1239;
          --color-accent-dark: #881337;

          --color-success:     #86EFAC;
          --color-warning:     #FDE68A;
          --color-info:        #93C5FD;
          --color-error:       #DC2626;

          --color-bg:          #FFF1F2;
          --color-surface:     #FFFFFF;
          --color-surface-alt: #FFE4E6;
          --color-border:      #FECDD3;

          --color-text:        #4C1D2B;
          --color-text-bold:   #3B0A1C;
          --color-text-muted:  #9F3D56;
          --color-text-inverse:#FFFFFF;

          background-color: var(--color-bg);
        }
        .bucin-admin-theme .bucin-header {
          background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%);
          border-bottom: 2px solid #FECDD3;
        }
        .bucin-admin-theme .bucin-nav-btn {
          background-color: #FFF1F2;
          border: 1.5px solid #FECDD3;
          color: #9F1239;
          transition: all 0.2s ease;
        }
        .bucin-admin-theme .bucin-nav-btn:hover {
          background-color: #FFE4E6;
          border-color: #E11D48;
          transform: scale(1.02);
        }
        .bucin-admin-theme .bucin-brand {
          background: linear-gradient(135deg, #E11D48, #9F1239);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Panel Header */}
      <header className="sticky top-0 z-10 px-4 py-3 shadow-sm bucin-header">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: back link + module name */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: "#9F3D56" }}
            >
              ← Pilih Modul
            </Link>
            <span style={{ color: "#FECDD3" }}>|</span>
            <span className="text-sm font-black bucin-brand">
              💖 Seberapa Bucin Kamu?
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
                  backgroundColor: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  color: "#9F3D56",
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
          aria-label="Navigasi panel Bucin"
        >
          {BUCIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-1.5 rounded-2xl text-sm font-bold bucin-nav-btn"
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
