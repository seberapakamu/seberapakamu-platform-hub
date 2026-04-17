import { createServerClient } from "@/lib/supabase.server";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import ModuleCard from "@/components/ModuleCard";
import { MODULES } from "@/lib/modules.config";

export default async function AdminModuleSelectorPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0F0F1A",
        color: "#F0F0FF",
        fontFamily: "var(--font-nunito), 'Nunito', Arial, sans-serif",
      }}
    >
      <style>{`
        .admin-module-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .admin-module-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .admin-module-grid { grid-template-columns: repeat(3, 1fr); }
        }
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>

      {/* Navbar */}
      <header
        style={{
          padding: "1.25rem 1rem",
          borderBottom: "1px solid #2A2A45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          🗂️ Admin Panel
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "#9090B0",
            background: "#1A1A2E",
            border: "1px solid #2A2A45",
            borderRadius: "999px",
            padding: "0.25rem 0.75rem",
          }}
        >
          {user.email}
        </span>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          padding: "3rem 1rem",
        }}
      >
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              color: "#FFFFFF",
              margin: "0 0 1rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Pilih Modul 🗂️
          </h1>
          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "#9090B0",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Pilih modul yang ingin kamu kelola. Setiap modul punya panel konfigurasi tersendiri.
          </p>
        </section>

        {/* Module grid */}
        <section aria-label="Daftar modul admin">
          <div className="admin-module-grid">
            {MODULES.map((module) => (
              <ModuleCard key={module.slug} module={module} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1.5rem 2rem",
          borderTop: "1px solid #2A2A45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#9090B0" }}>
          © {new Date().getFullYear()} Seberapa Kamu? — Admin Panel
        </span>
        <AdminLogoutButton />
      </footer>
    </div>
  );
}
